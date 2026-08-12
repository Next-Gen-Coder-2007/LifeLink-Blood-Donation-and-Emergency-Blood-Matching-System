import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set in .env")


# Connect to MongoDB Atlas
client = MongoClient(MONGODB_URL)


# Select database
db = client["lifelink"]


# Select collections
users_collection = db["users"]
donors_collection = db["donors"]
hospitals_collection = db["hospitals"]
blood_inventory_collection = db["blood_inventory"]


# Unique indexes
users_collection.create_index(
    "email",
    unique=True
)

hospitals_collection.create_index(
    "phone",
    unique=True
)


# Test connection
try:
    client.admin.command("ping")
    print("MongoDB connected successfully!")

except Exception as e:
    print("MongoDB connection failed:")
    print(e)