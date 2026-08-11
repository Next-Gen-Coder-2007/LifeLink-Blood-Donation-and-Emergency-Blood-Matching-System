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
    
class LoginRequest(BaseModel):
    email: str
    password: str