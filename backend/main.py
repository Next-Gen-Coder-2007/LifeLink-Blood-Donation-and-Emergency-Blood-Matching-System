from datetime import datetime, timezone
from bson import ObjectId
from fastapi import FastAPI, HTTPException
from pymongo.errors import DuplicateKeyError
from fastapi.middleware.cors import CORSMiddleware

from database import (
    users_collection,
    donors_collection,
    hospitals_collection,
    blood_inventory_collection,
    blood_requests_collection
)

from models import (
    UserCreate,
    DonorCreate,
    HospitalCreate,
    LoginRequest,
    BloodInventoryUpdate,
    BloodRequestCreate,
    BloodRequestResponse,
    BloodRequestUpdate,
    DonorBloodRequestResponse
)


app = FastAPI(
    title="LifeLink API",
    description="Blood Donation and Emergency Blood Matching System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
    
# ============================================================
# DELETE USER
# ============================================================

# ============================================================
# DELETE USER + CASCADE DELETE
# ============================================================

@app.delete("/users/{user_id}")
def delete_user(user_id: str):

    from bson import ObjectId

    # Convert string ID to MongoDB ObjectId
    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    # Check whether user exists
    user = users_collection.find_one({
        "_id": user_object_id
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # --------------------------------------------------------
    # DELETE RELATED DONOR PROFILE
    # --------------------------------------------------------

    donor_result = donors_collection.delete_one({
        "user_id": user_object_id
    })

    # --------------------------------------------------------
    # DELETE RELATED HOSPITAL PROFILE
    # --------------------------------------------------------

    hospital_result = hospitals_collection.delete_one({
        "user_id": user_object_id
    })

    # --------------------------------------------------------
    # DELETE USER
    # --------------------------------------------------------

    user_result = users_collection.delete_one({
        "_id": user_object_id
    })

    if user_result.deleted_count == 0:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete user"
        )

    return {
        "message": "User and related profiles deleted successfully",
        "user_id": user_id,
        "donor_deleted": donor_result.deleted_count > 0,
        "hospital_deleted": hospital_result.deleted_count > 0
    }
    
# ============================================================
# DELETE DONOR
# ============================================================

@app.delete("/donors/{donor_id}")
def delete_donor(donor_id: str):

    try:
        donor_object_id = ObjectId(donor_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid donor ID"
        )

    result = donors_collection.delete_one({
        "_id": donor_object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    return {
        "message": "Donor deleted successfully",
        "donor_id": donor_id
    }


# ============================================================
# DELETE HOSPITAL
# ============================================================

@app.delete("/hospitals/{hospital_id}")
def delete_hospital(hospital_id: str):

    try:
        hospital_object_id = ObjectId(hospital_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid hospital ID"
        )

    result = hospitals_collection.delete_one({
        "_id": hospital_object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found"
        )

    return {
        "message": "Hospital deleted successfully",
        "hospital_id": hospital_id
    }
    
@app.get("/hospitals/{hospital_id}/blood-bank")
def get_blood_bank(hospital_id: str):

    try:
        hospital_object_id = ObjectId(hospital_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid hospital ID"
        )

    # Check hospital exists
    hospital = hospitals_collection.find_one({
        "_id": hospital_object_id
    })

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found"
        )

    # Get blood inventory belonging to this hospital
    inventory = list(
        blood_inventory_collection.find({
            "hospital_id": hospital_object_id
        })
    )

    blood_groups = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    ]

    inventory_map = {
        item["blood_group"]: item["units"]
        for item in inventory
    }

    return [
        {
            "blood_group": group,
            "units": inventory_map.get(group, 0)
        }
        for group in blood_groups
    ]
    
@app.put("/hospitals/{hospital_id}/blood-bank")
def update_blood_bank(
    hospital_id: str,
    inventory: BloodInventoryUpdate
):

    try:
        hospital_object_id = ObjectId(hospital_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid hospital ID"
        )

    # Check hospital exists
    hospital = hospitals_collection.find_one({
        "_id": hospital_object_id
    })

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found"
        )

    # Validate blood group
    valid_groups = {
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    }

    if inventory.blood_group not in valid_groups:
        raise HTTPException(
            status_code=400,
            detail="Invalid blood group"
        )

    # Validate units
    if inventory.units < 0:
        raise HTTPException(
            status_code=400,
            detail="Units cannot be negative"
        )

    blood_inventory_collection.update_one(
        {
            "hospital_id": hospital_object_id,
            "blood_group": inventory.blood_group
        },
        {
            "$set": {
                "units": inventory.units,
                "updated_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )

    return {
        "message": "Blood inventory updated successfully",
        "blood_group": inventory.blood_group,
        "units": inventory.units
    }
    
    
@app.post("/blood-requests", response_model=BloodRequestResponse)
def create_blood_request(
    request: BloodRequestCreate
):
    valid_blood_groups = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
    ]

    if request.blood_group not in valid_blood_groups:
        raise HTTPException(
            status_code=400,
            detail="Invalid blood group"
        )

    if request.units_required <= 0:
        raise HTTPException(
            status_code=400,
            detail="Units required must be greater than 0"
        )

    valid_urgencies = [
        "normal",
        "urgent",
        "emergency",
    ]

    urgency = request.urgency.lower()

    if urgency not in valid_urgencies:
        raise HTTPException(
            status_code=400,
            detail="Urgency must be normal, urgent, or emergency"
        )

    # Check hospital exists
    if not ObjectId.is_valid(request.hospital_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid hospital ID"
        )

    hospital = hospitals_collection.find_one({
        "_id": ObjectId(request.hospital_id)
    })

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found"
        )

    now = datetime.utcnow()

    blood_request = {
        "hospital_id": request.hospital_id,
        "blood_group": request.blood_group,
        "units_required": request.units_required,
        "urgency": urgency,
        "patient_name": request.patient_name,
        "required_by": request.required_by,
        "status": "searching",
        "created_at": now.isoformat(),
    }

    result = blood_requests_collection.insert_one(
        blood_request
    )

    return {
        "id": str(result.inserted_id),
        "hospital_id": request.hospital_id,
        "blood_group": request.blood_group,
        "units_required": request.units_required,
        "urgency": urgency,
        "patient_name": request.patient_name,
        "required_by": request.required_by,
        "status": "searching",
        "created_at": now.isoformat(),
    }
    


@app.get(
    "/blood-requests/hospital/{hospital_id}",
    response_model=list[BloodRequestResponse]
)
def get_hospital_blood_requests(
    hospital_id: str
):
    if not ObjectId.is_valid(hospital_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid hospital ID"
        )

    hospital = hospitals_collection.find_one({
        "_id": ObjectId(hospital_id)
    })

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found"
        )

    requests = blood_requests_collection.find(
        {
            "hospital_id": hospital_id
        }
    ).sort(
        "created_at",
        -1
    )

    response = []

    for item in requests:
        response.append({
            "id": str(item["_id"]),
            "hospital_id": item["hospital_id"],
            "blood_group": item["blood_group"],
            "units_required": item["units_required"],
            "urgency": item["urgency"],
            "patient_name": item.get("patient_name"),
            "required_by": item.get("required_by"),
            "status": item["status"],
            "created_at": item["created_at"],
        })

    return response


@app.get(
    "/blood-requests/{request_id}",
    response_model=BloodRequestResponse
)
def get_blood_request(
    request_id: str
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    item = blood_requests_collection.find_one({
        "_id": ObjectId(request_id)
    })

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found"
        )

    return {
        "id": str(item["_id"]),
        "hospital_id": item["hospital_id"],
        "blood_group": item["blood_group"],
        "units_required": item["units_required"],
        "urgency": item["urgency"],
        "patient_name": item.get("patient_name"),
        "required_by": item.get("required_by"),
        "status": item["status"],
        "created_at": item["created_at"],
    }

@app.get(
    "/blood-requests/donor/{donor_id}",
    response_model=list[DonorBloodRequestResponse]
)
def get_donor_blood_requests(donor_id: str):

    if not ObjectId.is_valid(donor_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid donor ID"
        )

    # Find donor
    donor = donors_collection.find_one({
        "_id": ObjectId(donor_id)
    })

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    donor_blood_group = donor.get("blood_group")

    if not donor_blood_group:
        raise HTTPException(
            status_code=400,
            detail="Donor blood group not found"
        )

    print("DONOR ID:", donor_id)
    print("DONOR BLOOD GROUP:", donor_blood_group)

    # Find matching requests
    requests = blood_requests_collection.find({
        "blood_group": donor_blood_group
    }).sort(
        "created_at",
        -1
    )

    response = []

    for request in requests:

        print(
            "REQUEST:",
            request.get("blood_group"),
            request.get("status")
        )

        hospital_id = request.get(
            "hospital_id"
        )

        if not hospital_id:
            continue

        if not ObjectId.is_valid(hospital_id):
            continue

        hospital = hospitals_collection.find_one({
            "_id": ObjectId(hospital_id)
        })

        if not hospital:
            continue

        response.append({
            "id": str(request["_id"]),

            "hospital_id": str(
                hospital["_id"]
            ),
            "hospital_name": hospital.get(
                "hospital_name",
                ""
            ),
            "hospital_phone": hospital.get(
                "phone",
                ""
            ),
            "emergency_contact": hospital.get(
                "emergency_contact",
                ""
            ),
            "hospital_address": hospital.get(
                "address",
                ""
            ),
            "hospital_latitude": hospital.get(
                "latitude",
                0
            ),
            "hospital_longitude": hospital.get(
                "longitude",
                0
            ),

            "blood_group": request.get(
                "blood_group"
            ),
            "units_required": request.get(
                "units_required",
                0
            ),
            "urgency": request.get(
                "urgency",
                "normal"
            ),
            "patient_name": request.get(
                "patient_name"
            ),
            "required_by": request.get(
                "required_by"
            ),
            "status": request.get(
                "status",
                "searching"
            ),
            "created_at": request.get(
                "created_at",
                ""
            )
        })

    print(
        "MATCHING REQUESTS:",
        len(response)
    )

    return response



    
@app.put(
    "/blood-requests/{request_id}",
    response_model=BloodRequestResponse
)
def update_blood_request(
    request_id: str,
    request: BloodRequestUpdate
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    existing = blood_requests_collection.find_one({
        "_id": ObjectId(request_id)
    })

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found"
        )

    update_data = {}

    valid_blood_groups = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
    ]

    if request.blood_group is not None:

        if request.blood_group not in valid_blood_groups:
            raise HTTPException(
                status_code=400,
                detail="Invalid blood group"
            )

        update_data["blood_group"] = (
            request.blood_group
        )

    if request.units_required is not None:

        if request.units_required <= 0:
            raise HTTPException(
                status_code=400,
                detail="Units required must be greater than 0"
            )

        update_data["units_required"] = (
            request.units_required
        )

    if request.urgency is not None:

        valid_urgencies = [
            "normal",
            "urgent",
            "emergency",
        ]

        urgency = request.urgency.lower()

        if urgency not in valid_urgencies:
            raise HTTPException(
                status_code=400,
                detail="Invalid urgency"
            )

        update_data["urgency"] = urgency

    if request.patient_name is not None:
        update_data["patient_name"] = (
            request.patient_name
        )

    if request.required_by is not None:
        update_data["required_by"] = (
            request.required_by
        )

    if request.status is not None:

        valid_statuses = [
            "searching",
            "fulfilled",
            "cancelled",
            "completed",
        ]

        if request.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid request status"
            )

        update_data["status"] = request.status

    update_data["updated_at"] = (
        datetime.utcnow().isoformat()
    )

    if update_data:
        blood_requests_collection.update_one(
            {
                "_id": ObjectId(request_id)
            },
            {
                "$set": update_data
            }
        )

    updated = blood_requests_collection.find_one({
        "_id": ObjectId(request_id)
    })

    return {
        "id": str(updated["_id"]),
        "hospital_id": updated["hospital_id"],
        "blood_group": updated["blood_group"],
        "units_required": updated["units_required"],
        "urgency": updated["urgency"],
        "patient_name": updated.get("patient_name"),
        "required_by": updated.get("required_by"),
        "status": updated["status"],
        "created_at": updated["created_at"],
    }
    
@app.delete("/blood-requests/{request_id}")
def delete_blood_request(
    request_id: str
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    result = blood_requests_collection.delete_one({
        "_id": ObjectId(request_id)
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found"
        )

    return {
        "message": "Blood request deleted successfully",
        "id": request_id
    }