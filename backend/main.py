from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from pymongo.errors import DuplicateKeyError
from fastapi.middleware.cors import CORSMiddleware

from database import (
    users_collection,
    donors_collection,
    hospitals_collection
)

from models import (
    UserCreate,
    DonorCreate,
    HospitalCreate,
    LoginRequest
)


app = FastAPI(
    title="LifeLink API",
    description="Blood Donation and Emergency Blood Matching System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "LifeLink API is running"
    }


# ============================================================
# CREATE USER
# ============================================================

@app.post("/users")
def create_user(user: UserCreate):

    user_data = user.model_dump()

    # Add created_at
    user_data["created_at"] = datetime.now(timezone.utc)

    try:

        result = users_collection.insert_one(user_data)

        return {
            "message": "User created successfully",
            "user_id": str(result.inserted_id)
        }

    except DuplicateKeyError:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )


# ============================================================
# GET ALL USERS
# ============================================================

@app.get("/users")
def get_users():

    users = list(
        users_collection.find(
            {},
            {
                "password_hash": 0
            }
        )
    )

    for user in users:

        user["id"] = str(user["_id"])

        del user["_id"]

    return users


# ============================================================
# CREATE DONOR
# ============================================================

@app.post("/users/{user_id}/donor")
def create_donor(
    user_id: str,
    donor: DonorCreate
):

    from bson import ObjectId

    # Check whether user_id is valid
    try:

        user_object_id = ObjectId(user_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )


    # Check if user exists
    user = users_collection.find_one({
        "_id": user_object_id
    })

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # Make sure this user is a donor
    if user.get("role") != "donor":

        raise HTTPException(
            status_code=400,
            detail="User role is not donor"
        )


    # Check if donor profile already exists
    existing_donor = donors_collection.find_one({
        "user_id": user_object_id
    })

    if existing_donor:

        raise HTTPException(
            status_code=400,
            detail="Donor profile already exists"
        )


    donor_data = donor.model_dump(mode="json")

    # Create relationship
    donor_data["user_id"] = user_object_id


    result = donors_collection.insert_one(
        donor_data
    )


    return {
        "message": "Donor created successfully",
        "donor_id": str(result.inserted_id),
        "user_id": user_id
    }


# ============================================================
# GET ALL DONORS
# ============================================================

@app.get("/donors")
def get_donors():

    donors = list(
        donors_collection.find()
    )

    for donor in donors:

        donor["id"] = str(donor["_id"])
        donor["user_id"] = str(donor["user_id"])

        del donor["_id"]

    return donors


# ============================================================
# CREATE HOSPITAL
# ============================================================

@app.post("/users/{user_id}/hospital")
def create_hospital(
    user_id: str,
    hospital: HospitalCreate
):

    from bson import ObjectId

    # Convert string ID to ObjectId
    try:

        user_object_id = ObjectId(user_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )


    # Check user
    user = users_collection.find_one({
        "_id": user_object_id
    })

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # Check role
    if user.get("role") != "hospital":

        raise HTTPException(
            status_code=400,
            detail="User role is not hospital"
        )


    # Check if hospital profile already exists
    existing_hospital = hospitals_collection.find_one({
        "user_id": user_object_id
    })

    if existing_hospital:

        raise HTTPException(
            status_code=400,
            detail="Hospital profile already exists"
        )


    hospital_data = hospital.model_dump()

    # Create relationship
    hospital_data["user_id"] = user_object_id


    try:

        result = hospitals_collection.insert_one(
            hospital_data
        )

    except DuplicateKeyError:

        raise HTTPException(
            status_code=400,
            detail="Hospital phone already exists"
        )


    return {
        "message": "Hospital created successfully",
        "hospital_id": str(result.inserted_id),
        "user_id": user_id
    }


# ============================================================
# GET ALL HOSPITALS
# ============================================================

@app.get("/hospitals")
def get_hospitals():

    hospitals = list(
        hospitals_collection.find()
    )

    for hospital in hospitals:

        hospital["id"] = str(hospital["_id"])
        hospital["user_id"] = str(hospital["user_id"])

        del hospital["_id"]

    return hospitals


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login_user(credentials: LoginRequest):

    # Find user by email
    user = users_collection.find_one({
        "email": credentials.email
    })

    # User does not exist
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Check password
    if user.get("password_hash") != credentials.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }