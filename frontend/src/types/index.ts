export type UserRole = "donor" | "hospital" | "admin";

export interface User {
  user_id?: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface DonorRegistration {
  name: string;
  email: string;
  password: string;
  blood_group: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  availability: boolean;
  last_donation_date: string;
}

export interface HospitalRegistration {
  name: string;
  email: string;
  password: string;
  hospital_name: string;
  phone: string;
  emergency_contact: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface ToastMessage {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

export type LocationState = {
  latitude: number | null;
  longitude: number | null;
  status: "idle" | "loading" | "success" | "error";
  error?: string;
};

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
