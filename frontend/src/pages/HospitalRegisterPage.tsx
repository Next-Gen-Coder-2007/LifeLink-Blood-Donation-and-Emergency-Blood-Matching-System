import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, MapPin, Phone, Siren, User } from "lucide-react";
import { RegistrationLayout } from "@/layouts/RegistrationLayout";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { FormSection } from "@/components/FormSection";
import { LocationInput } from "@/components/LocationInput";
import { LoadingButton } from "@/components/LoadingButton";
import {
  isValidCoordinate,
  isValidEmail,
  isValidLatitude,
  isValidLongitude,
  isValidPassword,
  isValidPhone,
} from "@/lib/validation";
import { useToast } from "@/context/ToastContext";
import type { FieldErrors, HospitalRegistration } from "@/types";

type HospitalErrors = FieldErrors<HospitalRegistration> & {
  confirmPassword?: string;
};

const EMPTY_FORM: HospitalRegistration = {
  name: "",
  email: "",
  password: "",
  hospital_name: "",
  phone: "",
  emergency_contact: "",
  latitude: null,
  longitude: null,
  address: "",
};

export function HospitalRegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<HospitalRegistration>(EMPTY_FORM);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<HospitalErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof HospitalRegistration>(
    key: K,
    value: HospitalRegistration[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): HospitalErrors => {
    const next: HospitalErrors = {};

    if (!form.hospital_name.trim()) next.hospital_name = "Hospital name is required.";

    if (!form.name.trim()) next.name = "Administrator name is required.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";

    if (!form.password) next.password = "Password is required.";
    else if (!isValidPassword(form.password))
      next.password = "Password must be at least 8 characters.";

    if (!confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match.";

    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (!isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";

    if (!form.emergency_contact.trim())
      next.emergency_contact = "Emergency contact is required.";
    else if (!isValidPhone(form.emergency_contact))
      next.emergency_contact = "Enter a valid phone number.";

    if (!form.address.trim()) next.address = "Address is required.";

    if (!isValidCoordinate(form.latitude)) next.latitude = "Latitude is required.";
    else if (!isValidLatitude(form.latitude)) next.latitude = "Latitude must be between -90 and 90.";

    if (!isValidCoordinate(form.longitude)) next.longitude = "Longitude is required.";
    else if (!isValidLongitude(form.longitude)) next.longitude = "Longitude must be between -180 and 180.";

    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const next = validate();
  setErrors(next);

  if (Object.values(next).some(Boolean)) return;

  setSubmitting(true);

  try {
    // 1. CREATE USER

    const userResponse = await fetch(
      "http://127.0.0.1:8000/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password_hash: form.password,
          role: "hospital",
        }),
      }
    );

    if (!userResponse.ok) {
      const error = await userResponse.json();
      throw new Error(
        error.detail || "Failed to create user"
      );
    }

    const userData = await userResponse.json();

    // 2. CREATE HOSPITAL PROFILE

    const hospitalResponse = await fetch(
      `http://127.0.0.1:8000/users/${userData.user_id}/hospital`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hospital_name: form.hospital_name,
          phone: form.phone,
          emergency_contact: form.emergency_contact,
          latitude: form.latitude,
          longitude: form.longitude,
          address: form.address,
        }),
      }
    );

    if (!hospitalResponse.ok) {
      const error = await hospitalResponse.json();
      throw new Error(
        error.detail || "Failed to create hospital profile"
      );
    }

    const hospitalData = await hospitalResponse.json();

    console.log("Hospital created:", hospitalData);

    showToast("Hospital registration successful!");

    navigate("/dashboard", {
      replace: true,
    });

  } catch (error) {
    console.error(error);

    showToast(
      error instanceof Error
        ? error.message
        : "Registration failed. Please try again.",
      "error"
    );

  } finally {
    setSubmitting(false);
  }
};
  return (
    <RegistrationLayout
      title="Register Your Hospital"
      subtitle="Connect your hospital with LifeLink to manage emergency blood requirements."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection step="01" title="Account Information">
          <Input
            label="Hospital Administrator Name"
            placeholder="e.g. Dr. Anjali Sharma"
            autoComplete="name"
            value={form.name}
            error={errors.name}
            onChange={(event) => setField("name", event.target.value)}
            icon={<User className="h-4 w-4" aria-hidden />}
          />
          <Input
            type="email"
            label="Email"
            placeholder="admin@hospital.com"
            autoComplete="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setField("email", event.target.value)}
            icon={<Mail className="h-4 w-4" aria-hidden />}
          />
          <PasswordInput
            label="Password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            hint="Use at least 8 characters."
            value={form.password}
            error={errors.password}
            onChange={(event) => setField("password", event.target.value)}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </FormSection>

        <FormSection step="02" title="Hospital Information">
          <Input
            label="Hospital Name"
            placeholder="e.g. City General Hospital"
            value={form.hospital_name}
            error={errors.hospital_name}
            onChange={(event) => setField("hospital_name", event.target.value)}
            icon={<Building2 className="h-4 w-4" aria-hidden />}
          />
          <Input
            type="tel"
            label="Phone Number"
            placeholder="e.g. +91 12345 67890"
            autoComplete="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(event) => setField("phone", event.target.value)}
            icon={<Phone className="h-4 w-4" aria-hidden />}
          />
          <Input
            type="tel"
            label="Emergency Contact"
            placeholder="24x7 emergency line"
            value={form.emergency_contact}
            error={errors.emergency_contact}
            onChange={(event) => setField("emergency_contact", event.target.value)}
            icon={<Siren className="h-4 w-4" aria-hidden />}
          />
        </FormSection>

        <FormSection
          step="03"
          title="Location"
          description="Help donors find your hospital easily during emergencies."
        >
          <LocationInput
            latitude={form.latitude}
            longitude={form.longitude}
            errors={{ latitude: errors.latitude, longitude: errors.longitude }}
            onChange={(latitude, longitude) => {
              setField("latitude", latitude);
              setField("longitude", longitude);
            }}
          >
            <Input
              label="Address"
              placeholder="Street, city, postal code"
              autoComplete="street-address"
              className="sm:col-span-2"
              value={form.address}
              error={errors.address}
              onChange={(event) => setField("address", event.target.value)}
              icon={<MapPin className="h-4 w-4" aria-hidden />}
            />
          </LocationInput>
        </FormSection>

        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            size="lg"
            loading={submitting}
            loadingText="Registering…"
          >
            Register Hospital
          </LoadingButton>
        </div>
      </form>
    </RegistrationLayout>
  );
}
