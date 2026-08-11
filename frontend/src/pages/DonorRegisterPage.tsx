import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Mail, Phone, User } from "lucide-react";
import { RegistrationLayout } from "@/layouts/RegistrationLayout";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Select } from "@/components/Select";
import { FormSection } from "@/components/FormSection";
import { LocationInput } from "@/components/LocationInput";
import { Toggle } from "@/components/Toggle";
import { LoadingButton } from "@/components/LoadingButton";
import { registerDonor } from "@/lib/mockAuth";
import {
  isValidCoordinate,
  isValidEmail,
  isValidLatitude,
  isValidLongitude,
  isValidPassword,
  isValidPhone,
} from "@/lib/validation";
import { useToast } from "@/context/ToastContext";
import type { DonorRegistration, FieldErrors } from "@/types";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type DonorErrors = FieldErrors<DonorRegistration> & { confirmPassword?: string };

const EMPTY_FORM: DonorRegistration = {
  name: "",
  email: "",
  password: "",
  blood_group: "",
  phone: "",
  latitude: null,
  longitude: null,
  availability: true,
  last_donation_date: "",
};

export function DonorRegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<DonorRegistration>(EMPTY_FORM);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<DonorErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof DonorRegistration>(
    key: K,
    value: DonorRegistration[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): DonorErrors => {
    const next: DonorErrors = {};

    if (!form.name.trim()) next.name = "Full name is required.";
    else if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";

    if (!form.password) next.password = "Password is required.";
    else if (!isValidPassword(form.password))
      next.password = "Password must be at least 8 characters.";

    if (!confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match.";

    if (!form.blood_group) next.blood_group = "Select your blood group.";

    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (!isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";

    if (!isValidCoordinate(form.latitude)) next.latitude = "Latitude is required.";
    else if (!isValidLatitude(form.latitude)) next.latitude = "Latitude must be between -90 and 90.";

    if (!isValidCoordinate(form.longitude)) next.longitude = "Longitude is required.";
    else if (!isValidLongitude(form.longitude)) next.longitude = "Longitude must be between -180 and 180.";

    if (form.last_donation_date) {
      const donation = new Date(form.last_donation_date);
      if (Number.isNaN(donation.getTime())) {
        next.last_donation_date = "Enter a valid date.";
      } else if (donation.getTime() > Date.now()) {
        next.last_donation_date = "Last donation date cannot be in the future.";
      }
    }

    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await registerDonor(form);
      showToast("Donor registration successful!");
      navigate("/dashboard", { replace: true });
    } catch {
      showToast("Registration failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RegistrationLayout
      title="Become a LifeLink Donor"
      subtitle="Register your information and help save lives when it matters most."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection step="01" title="Account Information">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Mehta"
            autoComplete="name"
            value={form.name}
            error={errors.name}
            onChange={(event) => setField("name", event.target.value)}
            icon={<User className="h-4 w-4" aria-hidden />}
          />
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
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

        <FormSection step="02" title="Blood Information">
          <Select
            label="Blood Group"
            value={form.blood_group}
            error={errors.blood_group}
            onChange={(event) => setField("blood_group", event.target.value)}
          >
            <option value="">Select blood group</option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>
        </FormSection>

        <FormSection step="03" title="Contact Information">
          <Input
            type="tel"
            label="Phone Number"
            placeholder="e.g. +91 98765 43210"
            autoComplete="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(event) => setField("phone", event.target.value)}
            icon={<Phone className="h-4 w-4" aria-hidden />}
          />
        </FormSection>

        <FormSection
          step="04"
          title="Location"
          description="Share your location so hospitals can find you nearby in an emergency."
        >
          <LocationInput
            latitude={form.latitude}
            longitude={form.longitude}
            errors={{ latitude: errors.latitude, longitude: errors.longitude }}
            onChange={(latitude, longitude) => {
              setField("latitude", latitude);
              setField("longitude", longitude);
            }}
          />
        </FormSection>

        <FormSection step="05" title="Availability & History">
          <Toggle
            label="Available for Donation"
            description="Hospitals can contact you when your blood group is needed."
            checked={form.availability}
            onChange={(value) => setField("availability", value)}
          />
          <Input
            type="date"
            label="Last Donation Date"
            max={new Date().toISOString().split("T")[0]}
            value={form.last_donation_date}
            error={errors.last_donation_date}
            onChange={(event) => setField("last_donation_date", event.target.value)}
            icon={<CalendarDays className="h-4 w-4" aria-hidden />}
          />
        </FormSection>

        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            size="lg"
            loading={submitting}
            loadingText="Creating account…"
          >
            Create Donor Account
          </LoadingButton>
        </div>
      </form>
    </RegistrationLayout>
  );
}
