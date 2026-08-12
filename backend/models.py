from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


# ==========================================
# USER
# ==========================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password_hash: str
    role: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    created_at: str


# ==========================================
# DONOR
# ==========================================

class DonorCreate(BaseModel):
    blood_group: str
    phone: str
    latitude: float
    longitude: float
    availability: bool = True
    last_donation_date: Optional[date] = None


class DonorResponse(BaseModel):
    id: str
    user_id: str
    blood_group: str
    phone: str
    latitude: float
    longitude: float
    availability: bool
    last_donation_date: Optional[str] = None


# ==========================================
# HOSPITAL
# ==========================================

class HospitalCreate(BaseModel):
    hospital_name: str
    phone: str
    emergency_contact: str
    latitude: float
    longitude: float
    address: str


class HospitalResponse(BaseModel):
    id: str
    user_id: str
    hospital_name: str
    phone: str
    emergency_contact: str
    latitude: float
    longitude: float
    address: str


# ==========================================
# LOGIN
# ==========================================

class LoginRequest(BaseModel):
    email: str
    password: str


# ==========================================
# BLOOD INVENTORY
# ==========================================

class BloodInventoryUpdate(BaseModel):
    blood_group: str
    units: int


class BloodInventoryResponse(BaseModel):
    id: str
    hospital_id: str
    blood_group: str
    units: int
    updated_at: str


# ==========================================
# BLOOD REQUEST
# ==========================================

class BloodRequestCreate(BaseModel):
    hospital_id: str
    blood_group: str
    units_required: int
    urgency: str
    patient_name: Optional[str] = None
    required_by: Optional[str] = None


class BloodRequestResponse(BaseModel):
    id: str
    hospital_id: str
    blood_group: str
    units_required: int
    urgency: str
    patient_name: Optional[str] = None
    required_by: Optional[str] = None
    status: str
    created_at: str
    
class BloodRequestUpdate(BaseModel):
    blood_group: Optional[str] = None
    units_required: Optional[int] = None
    urgency: Optional[str] = None
    patient_name: Optional[str] = None
    required_by: Optional[str] = None
    status: Optional[str] = None
    
class DonorBloodRequestResponse(BaseModel):
    id: str

    # Hospital details
    hospital_id: str
    hospital_name: str
    hospital_phone: str
    emergency_contact: str
    hospital_address: str
    hospital_latitude: float
    hospital_longitude: float

    # Blood request details
    blood_group: str
    units_required: int
    urgency: str
    patient_name: Optional[str] = None
    required_by: Optional[str] = None
    status: str
    created_at: str


# ==========================================
# NOTIFICATION
# ==========================================

class NotificationCreate(BaseModel):
    recipient_id: str
    recipient_role: str
    notification_type: str
    title: str
    message: str
    blood_group: Optional[str] = None
    request_id: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    recipient_role: str
    notification_type: str
    title: str
    message: str
    blood_group: Optional[str] = None
    request_id: Optional[str] = None
    is_read: bool
    created_at: str