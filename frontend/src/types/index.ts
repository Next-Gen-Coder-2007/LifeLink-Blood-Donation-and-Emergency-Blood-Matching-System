export type UserRole = "donor" | "hospital" | "admin";

export interface User {
  user_id?: string | number;
  id?: string;
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

export interface DonationPledgeItem {
  id: string;
  request_id: string;
  hospital_id: string;
  hospital_name?: string;
  hospital_phone?: string;
  hospital_address?: string;
  hospital_latitude?: number;
  hospital_longitude?: number;
  donor_id: string;
  donor_user_id?: string;
  donor_name: string;
  donor_phone: string;
  blood_group: string;
  status: "pledged" | "acknowledged" | "completed" | "cancelled";
  estimated_arrival: string;
  notes?: string;
  urgency?: "normal" | "urgent" | "emergency";
  patient_name?: string | null;
  created_at: string;
}

export interface DonationHistoryItem {
  id: string;
  donor_id: string;
  hospital_id: string;
  blood_request_id?: string | null;
  pledge_id?: string | null;
  blood_group: string;
  units: number;
  donation_date: string;
  donor_name: string;
  hospital_name: string;
  hospital_address: string;
  certificate_id: string;
  status: "verified" | "completed";
  remarks?: string;
}

export interface DonorImpactStats {
  donor_id: string;
  blood_group: string;
  availability?: boolean;
  last_donation_date?: string | null;
  days_since_last_donation?: number | null;
  total_donations: number;
  total_units: number;
  lives_saved: number;
  hero_tier: string;
  is_eligible?: boolean;
  days_remaining?: number;
  next_eligible_date?: string | null;
  history: DonationHistoryItem[];
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  recipient_role: string;
  notification_type: string;
  title: string;
  message: string;
  blood_group?: string | null;
  request_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DonorMapItem {
  id: string;
  user_id: string;
  donor_name: string;
  email: string;
  blood_group: string;
  phone: string;
  latitude: number;
  longitude: number;
  availability: boolean;
  last_donation_date?: string | null;
  distanceKm?: number | null;
  estimatedMins?: number | null;
  matchScore?: number;
  matchTier?: string;
  matchLabel?: string;
  badgeBg?: string;
  badgeColor?: string;
  badgeBorder?: string;
  compatible?: boolean;
}
