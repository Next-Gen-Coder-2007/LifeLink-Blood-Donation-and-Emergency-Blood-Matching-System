# LifeLink — Intelligent Blood Donation and Emergency Matching Platform

<p align="center">
  <img src="frontend/public/flow.png" alt="LifeLink Architecture and Process Flow" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_v8-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/React-v18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-v5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
</p>

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [Key Capabilities and Features](#key-capabilities-and-features)
3. [System Architecture](#system-architecture)
   - [High-Level 3-Tier Architecture](#high-level-3-tier-architecture)
   - [API Request and Middleware Pipeline](#api-request-and-middleware-pipeline)
   - [Emergency Blood Matching Flowchart](#emergency-blood-matching-flowchart)
   - [Referential Integrity and Cascade Deletion Lifecycle](#referential-integrity-and-cascade-deletion-lifecycle)
4. [Entity-Relationship (ER) Diagram](#entity-relationship-er-diagram)
5. [End-to-End Business Processes](#end-to-end-business-processes)
   - [1. User Onboarding and Role Segregation](#1-user-onboarding-and-role-segregation)
   - [2. Hospital Blood Bank Stock Management](#2-hospital-blood-bank-stock-management)
   - [3. Emergency Request Triage and Dispatch](#3-emergency-request-triage-and-dispatch)
   - [4. Donor Matching and Response Workflow](#4-donor-matching-and-response-workflow)
   - [5. Administrative Oversight and Moderation](#5-administrative-oversight-and-moderation)
6. [Complete RESTful API Specification](#complete-restful-api-specification)
7. [Database Schema and Indexing Strategy](#database-schema-and-indexing-strategy)
8. [Blood Compatibility Reference Matrix](#blood-compatibility-reference-matrix)
9. [Installation and Setup Guide](#installation-and-setup-guide)
   - [Prerequisites](#prerequisites)
   - [Backend Configuration and Execution](#backend-configuration-and-execution)
   - [Frontend Configuration and Execution](#frontend-configuration-and-execution)
10. [Project Directory Structure](#project-directory-structure)
11. [Future Scope and Comprehensive Roadmap (Final Review)](#future-scope-and-comprehensive-roadmap-final-review)
12. [License and Acknowledgments](#license-and-acknowledgments)

---

## Executive Overview

**LifeLink** is a mission-critical, full-stack healthcare platform engineered to bridge the critical time gap between emergency blood requirements and active volunteer donors. By connecting hospitals, registered blood donors, and medical administrators within a unified ecosystem, LifeLink accelerates blood discovery, tracks real-time hospital inventories across 8 blood groups, and matches urgent blood requests with compatible nearby donors.

### Core Value Pillars
- **Zero-Latency Emergency Triage**: Rapid creation and instant dispatch of urgent and emergency blood requests.
- **Automated Compatibility Matching**: Real-time aggregation of requests matching ABO/Rh blood groups and geolocation.
- **Comprehensive Hospital Blood Banks**: Live tracking of available blood units across all 8 major blood types.
- **Enterprise Data Integrity**: Automated cascade deletion, unique index enforcement, and sanitized RESTful interfaces.

---

## Key Capabilities and Features

| Capability | Description |
| :--- | :--- |
| **Multi-Role Authentication** | Tailored dashboards and access control for **Donors**, **Hospitals**, and **System Administrators**. |
| **Live Blood Bank Matrix** | 8-group matrix (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) with instant stock updates and threshold indicators. |
| **Emergency Broadcast Engine** | Hospitals broadcast critical blood requests with triage priorities (`normal`, `urgent`, `emergency`). |
| **Donor Smart Alerts** | Donors receive real-time visibility into compatible blood requests with hospital contact and GPS coordinates. |
| **Cascade Account Lifecycle** | Deleting a user account automatically cleans up linked profiles, inventory documents, and open requests. |
| **Admin Operations Hub** | Centralized console to audit, filter, monitor, and moderate users, donors, and hospital networks. |

---

## System Architecture

### High-Level 3-Tier Architecture

```mermaid
graph TB
    subgraph Client_Layer["Presentation Tier (Client Web App & Native Mobile App)"]
        UI_Landing["Landing Page & Hero Portal"]
        UI_Auth["Auth Portal (Login / Register Modals)"]
        UI_Donor["Donor Dashboard & Match Radar"]
        UI_Hospital["Hospital Dashboard & Blood Bank"]
        UI_Admin["Admin Oversight & Governance Center"]
        UI_Mobile["Cross-Platform Mobile App (iOS / Android)"]
    end

    subgraph Gateway_Layer["Security & API Gateway Layer (Express.js)"]
        MW_Helmet["Helmet Security Headers"]
        MW_CORS["CORS Protection"]
        MW_Parser["JSON & URL Parsers (10MB Limit)"]
        MW_ErrorHandler["Standardized Error Handler"]
    end

    subgraph Controller_Layer["Application Tier (Controllers & Services)"]
        Ctrl_Auth["Auth Controller (Login & Session)"]
        Ctrl_User["User Controller (Cascade Management)"]
        Ctrl_Donor["Donor Controller (Profile & Geolocation)"]
        Ctrl_Hospital["Hospital Controller (Profile & Directory)"]
        Ctrl_BloodBank["Blood Bank Controller (8-Group Matrix)"]
        Ctrl_Request["Blood Request Controller (Emergency Triage)"]
        Ctrl_Analytics["Analytics Controller (Platform Metrics)"]
    end

    subgraph Data_Layer["Data Tier (MongoDB & Mongoose ODM)"]
        Col_Users[("users Collection - Unique Email Index")]
        Col_Donors[("donors Collection - Compound Index")]
        Col_Hospitals[("hospitals Collection - Unique Phone Index")]
        Col_Inventory[("blood_inventory Collection - Compound Unique Index")]
        Col_Requests[("blood_requests Collection - Index [hospital_id, created_at]")]
        Col_Notifications[("notifications Collection - Index [recipient_id, created_at]")]
    end

    UI_Landing & UI_Auth & UI_Donor & UI_Hospital & UI_Admin & UI_Mobile -->|HTTP/REST| MW_Helmet
    MW_Helmet --> MW_CORS
    MW_CORS --> MW_Parser

    MW_Parser --> Ctrl_Auth & Ctrl_User & Ctrl_Donor & Ctrl_Hospital & Ctrl_BloodBank & Ctrl_Request & Ctrl_Analytics

    Ctrl_Auth --> Col_Users
    Ctrl_User --> Col_Users & Col_Donors & Col_Hospitals & Col_Inventory & Col_Requests
    Ctrl_Donor --> Col_Donors & Col_Users
    Ctrl_Hospital --> Col_Hospitals & Col_Users
    Ctrl_BloodBank --> Col_Inventory & Col_Hospitals
    Ctrl_Request --> Col_Requests & Col_Hospitals & Col_Donors
    Ctrl_Analytics --> Col_Users & Col_Donors & Col_Hospitals & Col_Inventory & Col_Requests

    Ctrl_Auth & Ctrl_User & Ctrl_Donor & Ctrl_Hospital & Ctrl_BloodBank & Ctrl_Request & Ctrl_Analytics -.->|On Error| MW_ErrorHandler
```

---

### API Request and Middleware Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App (React / Mobile App)
    participant MW as Express Middleware (CORS / Helmet)
    participant Router as API Router (/api/v1)
    participant Controller as Domain Controller
    participant Model as Mongoose ODM
    participant DB as MongoDB Database
    participant ErrorMW as Global Error Handler

    Client->>MW: HTTP Request (Method, URL, Headers, Body)
    MW->>MW: Apply Security Headers and Verify CORS Origin
    MW->>MW: Parse JSON Body Payload
    MW->>Router: Route Dispatch (/blood-requests, /users)
    Router->>Controller: Invoke Controller Action
    Controller->>Controller: Validate Payload and Constraints

    alt Validation Failure
        Controller-->>ErrorMW: next(new AppError(message, 400))
        ErrorMW-->>Client: JSON Error Response (400 Bad Request)
    else Validation Success
        Controller->>Model: Execute Query / Mutation
        Model->>DB: MongoDB Wire Protocol Command
        DB-->>Model: Raw BSON Document / Result
        Model-->>Controller: Hydrated Model Instance
        Controller-->>Client: JSON Response (200 / 201 Created)
    end
```

---

### Emergency Blood Matching Flowchart

```mermaid
flowchart TD
    Start(["Hospital Initiates Emergency Blood Request"]) --> InputCheck{"Validate Request Data"}
    InputCheck -->|"Invalid Data"| ReturnErr["Return 400 Bad Request"]
    InputCheck -->|"Valid Data"| CheckHosp{"Hospital Exists in DB?"}
    
    CheckHosp -->|"No"| ReturnNotFound["Return 404 Hospital Not Found"]
    CheckHosp -->|"Yes"| SaveReq["Save Request with Status = 'searching'"]
    
    SaveReq --> Broadcast["Trigger Donor Matching Engine"]
    Broadcast --> QueryDonors["Query Donors matching Blood Group and Availability = true"]
    
    QueryDonors --> FormatAlerts["Enrich Request with Hospital Contact, Address and Coordinates"]
    FormatAlerts --> NotifyDonors["Dispatch to Active Donor Radar"]
    
    NotifyDonors --> DonorAction{"Donor Responds to Request?"}
    DonorAction -->|"Accept and Contact"| Coordinate["Hospital and Donor Coordinate Fulfillment"]
    DonorAction -->|"Pending / Waiting"| KeepSearching["Status remains 'searching'"]
    
    Coordinate --> Fulfill["Hospital updates Status to fulfilled or completed"]
    Fulfill --> UpdateStock["Hospital updates Blood Bank Stock (+Units)"]
    UpdateStock --> Done(["Workflow Complete"])
```

---

### Referential Integrity and Cascade Deletion Lifecycle

```mermaid
flowchart LR
    AdminReq(["Delete User Request"]) --> ValidateUser{"Check User ID"}
    ValidateUser -->|"Invalid ID"| Err400["Return 400 Invalid ID"]
    ValidateUser -->|"Not Found"| Err404["Return 404 User Not Found"]
    
    ValidateUser -->|"Valid User"| CascadeStart["Begin Cascade Cleanup"]
    
    CascadeStart --> DelDonor["Delete Donor Profile (user_id = User._id)"]
    CascadeStart --> FindHosp{"Hospital Profile Exists?"}
    
    FindHosp -->|"Yes"| DelStock["Delete all BloodInventory (hospital_id = Hosp._id)"]
    DelStock --> DelReqs["Delete all BloodRequests (hospital_id = Hosp._id)"]
    DelReqs --> DelHosp["Delete Hospital Profile"]
    
    FindHosp -->|"No"| DelUserDoc["Delete User Document"]
    DelDonor --> DelUserDoc
    DelHosp --> DelUserDoc
    
    DelUserDoc --> Complete(["Return 200: Cascade Cleanup Successful"])
```

---

## Entity-Relationship (ER) Diagram and DBMS Foundations

The LifeLink system data model is engineered following formal Database Management System (DBMS) principles, combining relational structural integrity with high-concurrency document-store performance.

### Enhanced Crow's Foot Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o| DONOR : "specializes into donor profile"
    USER ||--o| HOSPITAL : "specializes into hospital profile"
    HOSPITAL ||--o{ BLOOD_INVENTORY : "maintains stock matrix"
    HOSPITAL ||--o{ BLOOD_REQUEST : "broadcasts emergency needs"
    DONOR ||--o{ NOTIFICATION : "receives targeted alerts"
    HOSPITAL ||--o{ NOTIFICATION : "receives status dispatches"
    BLOOD_REQUEST ||--o{ NOTIFICATION : "triggers alert generation"

    USER {
        ObjectId _id PK "Primary Key (Auto-generated BSON ObjectId)"
        string name "User full legal name"
        string email UK "Unique lowercase user email address"
        string password_hash "Bcrypt salted password digest"
        string role "Role enum: donor | hospital | admin"
        date created_at "System generation timestamp"
        date updated_at "System modification timestamp"
    }

    DONOR {
        ObjectId _id PK "Primary Key (Auto-generated ObjectId)"
        ObjectId user_id FK "Foreign Key referencing users._id"
        string blood_group "ABO/Rh Blood Group: A+, A-, B+, B-, AB+, AB-, O+, O-"
        string phone "Contact telephone number"
        float latitude "Geographical GPS Latitude"
        float longitude "Geographical GPS Longitude"
        boolean availability "Active donation readiness flag"
        string last_donation_date "Date of preceding donation"
        date created_at "Profile creation timestamp"
        date updated_at "Profile modification timestamp"
    }

    HOSPITAL {
        ObjectId _id PK "Primary Key (Auto-generated ObjectId)"
        ObjectId user_id FK "Foreign Key referencing users._id"
        string hospital_name "Official healthcare facility name"
        string phone UK "Main facility contact line"
        string emergency_contact "24/7 dedicated critical trauma hotline"
        float latitude "Geographical GPS Latitude"
        float longitude "Geographical GPS Longitude"
        string address "Physical street and district address"
        date created_at "Profile creation timestamp"
        date updated_at "Profile modification timestamp"
    }

    BLOOD_INVENTORY {
        ObjectId _id PK "Primary Key (Auto-generated ObjectId)"
        ObjectId hospital_id FK "Foreign Key referencing hospitals._id"
        string blood_group "Blood type key (A+, A-, B+, B-, AB+, AB-, O+, O-)"
        int units "Available whole blood units in storage"
        date updated_at "Stock audit modification timestamp"
    }

    BLOOD_REQUEST {
        ObjectId _id PK "Primary Key (Auto-generated ObjectId)"
        ObjectId hospital_id FK "Foreign Key referencing hospitals._id"
        string blood_group "Target blood group requested"
        int units_required "Required blood unit volume"
        string urgency "Triage urgency tier: normal | urgent | emergency"
        string patient_name "Recipient / Patient identifier"
        string required_by "Clinical deadline timestamp string"
        string status "Triage state: searching | fulfilled | cancelled | completed"
        date created_at "Request broadcast timestamp"
        date updated_at "Request lifecycle state update timestamp"
    }

    NOTIFICATION {
        ObjectId _id PK "Primary Key (Auto-generated ObjectId)"
        string recipient_id "Target recipient document identifier"
        string recipient_role "Recipient role partition: donor | hospital | admin | all"
        string notification_type "Category: emergency_alert | system | request_update"
        string title "Notification alert header"
        string message "Detailed message dispatch payload"
        string blood_group "Targeted blood group tag"
        string request_id FK "Optional foreign reference to blood_requests._id"
        boolean is_read "Acknowledgement status flag"
        date created_at "Notification dispatch timestamp"
        date updated_at "Notification update timestamp"
    }
```

---

### DBMS Concepts & Theoretical Analysis

#### 1. Relational Schema Mapping & Mathematical Notation
In relational algebra, the LifeLink database structure is formalized into 6 normalized relations:

- $\text{USER}(\underline{\text{user\_id}}, \text{name}, \text{email}, \text{password\_hash}, \text{role}, \text{created\_at}, \text{updated\_at})$
- $\text{DONOR}(\underline{\text{donor\_id}}, \overline{\text{user\_id}}, \text{blood\_group}, \text{phone}, \text{latitude}, \text{longitude}, \text{availability}, \text{last\_donation\_date}, \text{created\_at}, \text{updated\_at})$
- $\text{HOSPITAL}(\underline{\text{hospital\_id}}, \overline{\text{user\_id}}, \text{hospital\_name}, \text{phone}, \text{emergency\_contact}, \text{latitude}, \text{longitude}, \text{address}, \text{created\_at}, \text{updated\_at})$
- $\text{BLOOD\_INVENTORY}(\underline{\text{inventory\_id}}, \overline{\text{hospital\_id}}, \text{blood\_group}, \text{units}, \text{updated\_at})$
- $\text{BLOOD\_REQUEST}(\underline{\text{request\_id}}, \overline{\text{hospital\_id}}, \text{blood\_group}, \text{units\_required}, \text{urgency}, \text{patient\_name}, \text{required\_by}, \text{status}, \text{created\_at}, \text{updated\_at})$
- $\text{NOTIFICATION}(\underline{\text{notification\_id}}, \text{recipient\_id}, \text{recipient\_role}, \text{notification\_type}, \text{title}, \text{message}, \text{blood\_group}, \overline{\text{request\_id}}, \text{is\_read}, \text{created\_at}, \text{updated\_at})$

*Where underlined attributes ($\underline{\text{PK}}$) denote Primary Keys, and over-lined attributes ($\overline{\text{FK}}$) denote Foreign Keys.*

---

#### 2. Entity Specialization and Generalization (Inheritance Hierarchy)
LifeLink implements **Disjoint Class Table Inheritance (Subtype Modeling)**:
- **Supertype**: The `USER` entity encapsulates shared authentication attributes (`name`, `email`, `password_hash`, `role`).
- **Subtypes**:
  - `DONOR`: Extends `USER` with volunteer biological and spatial telemetry (`blood_group`, `phone`, `latitude`, `longitude`, `availability`).
  - `HOSPITAL`: Extends `USER` with medical enterprise infrastructure (`hospital_name`, `emergency_contact`, `address`, `latitude`, `longitude`).
- **Constraint Enforcement**: The `role` discriminator column strictly guarantees mutually exclusive subtype relationships:
  $$\forall u \in \text{USER}, \text{role}(u) = \text{'donor'} \iff \exists! d \in \text{DONOR} \text{ such that } d.\text{user\_id} = u.\text{\_id}$$
  $$\forall u \in \text{USER}, \text{role}(u) = \text{'hospital'} \iff \exists! h \in \text{HOSPITAL} \text{ such that } h.\text{user\_id} = u.\text{\_id}$$

---

#### 3. Database Integrity Constraints Matrix

| Constraint Category | DBMS Principle | Mongoose & MongoDB Implementation | SQL Equivalent |
| :--- | :--- | :--- | :--- |
| **Entity Integrity** | Every relation must possess a non-null, immutable Primary Key. | `_id: { type: Schema.Types.ObjectId, auto: true }` | `id INT PRIMARY KEY AUTO_INCREMENT` |
| **Referential Integrity** | Foreign Keys must either match a valid PK in the referenced relation or be null. | `user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }` | `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` |
| **Domain Integrity** | Attributes must adhere strictly to defined data types, ranges, and enumerated sets. | `blood_group: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }` | `CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))` |
| **User-Defined Integrity** | Compound business rules preventing state duplication. | `BloodInventorySchema.index({ hospital_id: 1, blood_group: 1 }, { unique: true })` | `CONSTRAINT unique_stock UNIQUE (hospital_id, blood_group)` |

---

#### 4. Normalization and De-normalization Trade-off Analysis

##### Normal Form Proofs:
1. **First Normal Form (1NF)**: All attributes contain strictly atomic, scalar values. No multi-valued repeating groups (e.g. the 8 blood types are normalized into discrete rows in `blood_inventory` rather than an unindexed array).
2. **Second Normal Form (2NF)**: All non-key attributes are fully functionally dependent on the complete primary key ($\text{PK} \to \text{Attributes}$). No partial dependencies exist.
3. **Third Normal Form (3NF)**: No transitive functional dependencies exist ($X \to Y$ and $Y \to Z$ where $X$ is $\text{PK}$). For example, hospital address and phone are stored solely in `HOSPITAL`, not duplicated in `BLOOD_REQUEST`.
4. **Boyce-Codd Normal Form (BCNF)**: For every functional dependency $X \to Y$, $X$ is a superkey.

##### Controlled De-normalization for Ultra-Low Latency Triage:
In mission-critical emergency scenarios where seconds save lives, join operations across distributed shards introduce I/O latency. To achieve sub-millisecond query execution:
- The donor matching endpoint (`GET /blood-requests/donor/:id`) utilizes index-covered `$lookup` joins in MongoDB, consolidating hospital contact and coordinates directly into the response payload in a single database round-trip ($O(1)$ lookup time).

---

#### 5. ACID Transaction Management and Single-Document Atomicity

- **Atomicity ($A$)**: MongoDB guarantees single-document atomicity for all write and update operations. Stock modifications use atomic operators (`$set`, `$inc`) ensuring partial inventory updates never occur.
- **Consistency ($C$)**: Mongoose pre-save validation hooks and unique index constraints prevent invalid states from reaching the database storage engine (WiredTiger).
- **Isolation ($I$)**: Read-uncommitted and read-committed isolation levels prevent dirty reads during concurrent triage updates.
- **Durability ($D$)**: Write concerns (`w: 1` with write-ahead journal logging) guarantee committed transactions survive unexpected server restarts.

---

### Mongoose Code Implementation and DBMS Mapping

Below are the core schema models illustrating the direct application of DBMS concepts in the Node.js + Mongoose codebase:

#### 1. User Entity Schema ([backend/src/models/User.js](file:///e:/DBMS/backend/src/models/User.js))
```javascript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Unique B-Tree Index (Entity Integrity)
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['donor', 'hospital', 'admin'], // Domain Integrity Constraint
      default: 'donor',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);
```

#### 2. Blood Inventory Schema with Compound Unique Index ([backend/src/models/BloodInventory.js](file:///e:/DBMS/backend/src/models/BloodInventory.js))
```javascript
import mongoose from 'mongoose';

const BloodInventorySchema = new mongoose.Schema(
  {
    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital', // Referential Integrity (Foreign Key)
      required: [true, 'Hospital ID is required'],
    },
    blood_group: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Domain Constraint
    },
    units: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Units cannot be negative'], // Domain Range Constraint
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
  }
);

// Compound Unique Key: Enforces strictly 1 record per blood group per hospital
BloodInventorySchema.index({ hospital_id: 1, blood_group: 1 }, { unique: true });
```

#### 3. Referential Cascade Deletion Execution ([backend/src/controllers/userController.js](file:///e:/DBMS/backend/src/controllers/userController.js))
```javascript
export const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id);
    if (!user) return next(new AppError('User not found', 404));

    // Referential Integrity: Cascade deletion in topological dependency order
    await Donor.deleteMany({ user_id });

    const hospital = await Hospital.findOne({ user_id });
    if (hospital) {
      await BloodInventory.deleteMany({ hospital_id: hospital._id });
      await BloodRequest.deleteMany({ hospital_id: hospital._id });
      await Hospital.findByIdAndDelete(hospital._id);
    }

    await User.findByIdAndDelete(user_id);

    res.status(200).json({
      message: 'User and all associated profile, inventory, and request records cascade deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
```

#### 4. Geospatial Proximity Matching & Haversine Calculation
LifeLink computes spatial proximity between donors and emergency trauma centers using the spherical Haversine trigonometric formula:

$$d = 2R \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$\text{where } a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$

- $\phi_1, \phi_2$: Latitude coordinates of donor and hospital in radians.
- $\lambda_1, \lambda_2$: Longitude coordinates in radians.
- $R$: Earth mean radius ($6,371 \text{ km}$).

```javascript
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
```

---

### Comprehensive Database Query Catalog (DBMS Operations & Mathematical Formalization)

Below is the exhaustive mathematical and practical breakdown of every query executed within the LifeLink platform, contrasting formal Relational Algebra, ANSI SQL:1999, MongoDB Mongoose ODM queries, and internal storage engine execution plans:

#### Query 1: User Identity Authentication & Single-Record Selection
- **Relational Algebra**:
  $$\sigma_{\text{email} = \text{target\_email}}(\text{USER})$$
- **Standard ANSI SQL**:
  ```sql
  SELECT user_id, name, email, password_hash, role
  FROM users
  WHERE email = 'donor@lifelink.org'
  LIMIT 1;
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const user = await User.findOne({ email: email.toLowerCase() });
  ```
- **Storage Engine Execution Plan**: `IXSCAN` on `{ email: 1 }` Unique B-Tree Index. Time Complexity: $O(\log N)$. Zero collection scans (`COLLSCAN: 0`).

---

#### Query 2: Active Donor Discovery for Emergency Broadcast
- **Relational Algebra**:
  $$\pi_{\text{donor\_id}, \text{phone}, \text{latitude}, \text{longitude}, \text{availability}}(\sigma_{\text{blood\_group} = \text{'O-'} \land \text{availability} = \text{true}}(\text{DONOR}))$$
- **Standard ANSI SQL**:
  ```sql
  SELECT id, phone, latitude, longitude, availability
  FROM donors
  WHERE blood_group = 'O-' AND availability = TRUE;
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const donors = await Donor.find({ blood_group: 'O-', availability: true });
  ```
- **Storage Engine Execution Plan**: `IXSCAN` utilizing the Compound Index `{ blood_group: 1, availability: 1 }`. Filtering occurs at index-level prior to document fetching.

---

#### Query 3: Emergency Transfusion Request Join with Healthcare Facility Contact
- **Relational Algebra**:
  $$\pi_{\text{r.id}, \text{r.blood\_group}, \text{r.units}, \text{r.urgency}, \text{h.hospital\_name}, \text{h.phone}, \text{h.address}, \text{h.latitude}, \text{h.longitude}}(\sigma_{\text{r.blood\_group} = \text{'O-'} \land \text{r.status} = \text{'searching'}}(\text{BLOOD\_REQUEST } r) \bowtie_{r.\text{hospital\_id} = h.\text{\_id}} \text{HOSPITAL } h)$$
- **Standard ANSI SQL**:
  ```sql
  SELECT 
    r.id AS request_id,
    r.blood_group,
    r.units_required,
    r.urgency,
    r.status,
    h.hospital_name,
    h.phone AS hospital_phone,
    h.emergency_contact,
    h.address AS hospital_address,
    h.latitude AS hospital_latitude,
    h.longitude AS hospital_longitude
  FROM blood_requests r
  INNER JOIN hospitals h ON r.hospital_id = h.id
  WHERE r.blood_group = 'O-' AND r.status = 'searching'
  ORDER BY r.created_at DESC;
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const requests = await BloodRequest.find({ blood_group: 'O-', status: 'searching' })
    .populate('hospital_id')
    .sort({ created_at: -1 });
  ```
- **Storage Engine Execution Plan**: `IXSCAN` on `{ blood_group: 1, status: 1 }` followed by indexed primary key lookups against `hospitals._id`.

---

#### Query 4: 8-Group Refrigeration Stock Imputation & Fetch
- **Relational Algebra**:
  $$\pi_{\text{blood\_group}, \text{units}}(\sigma_{\text{hospital\_id} = \text{target\_id}}(\text{BLOOD\_INVENTORY}))$$
- **Standard ANSI SQL**:
  ```sql
  SELECT blood_group, units
  FROM blood_inventory
  WHERE hospital_id = '65d1f89e2c4a1b0012e4f5a1';
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const stock = await BloodInventory.find({ hospital_id: targetId });
  ```
- **Storage Engine Execution Plan**: `IXSCAN` on compound unique index `{ hospital_id: 1, blood_group: 1 }` prefix `{ hospital_id: 1 }`. Guarantees retrieval of 8 records in $O(\log N)$ time.

---

#### Query 5: Atomic Inventory Modification (Compare-and-Swap / Upsert)
- **Relational Algebra**:
  $$\text{UPSERT}(\text{BLOOD\_INVENTORY}, \text{hospital\_id} = h \land \text{blood\_group} = g, \text{units} \leftarrow u)$$
- **Standard ANSI SQL**:
  ```sql
  INSERT INTO blood_inventory (hospital_id, blood_group, units, updated_at)
  VALUES ('65d1f89e2c4a1b0012e4f5a1', 'O+', 12, NOW())
  ON CONFLICT (hospital_id, blood_group)
  DO UPDATE SET units = EXCLUDED.units, updated_at = NOW();
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const item = await BloodInventory.findOneAndUpdate(
    { hospital_id, blood_group },
    { $set: { units } },
    { new: true, upsert: true, runValidators: true }
  );
  ```
- **Storage Engine Execution Plan**: Unique Index seek on `{ hospital_id: 1, blood_group: 1 }`. If matched, applies single-document in-place mutation. If unindexed, generates a new document atomically without table locks.

---

#### Query 6: Aggregate Platform Blood Reserves Rollup
- **Relational Algebra**:
  $$\gamma_{\text{blood\_group}, \text{SUM}(\text{units}) \to \text{total\_units}}(\text{BLOOD\_INVENTORY})$$
- **Standard ANSI SQL**:
  ```sql
  SELECT blood_group, COALESCE(SUM(units), 0) AS total_units
  FROM blood_inventory
  GROUP BY blood_group;
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const stats = await BloodInventory.aggregate([
    {
      $group: {
        _id: '$blood_group',
        total_units: { $sum: '$units' },
      },
    },
  ]);
  ```
- **Storage Engine Execution Plan**: Document pipeline engine executing an in-memory hash aggregation across the 8 distinct blood group buckets.

---

#### Query 7: Topological Referential Cascade Deletion
- **Relational Algebra**:
  $$\text{DELETE FROM } \text{USER} \text{ WHERE } \text{user\_id} = u \implies \text{CASCADE DELETE } (\text{DONOR}, \text{HOSPITAL} \to (\text{BLOOD\_INVENTORY}, \text{BLOOD\_REQUEST}))$$
- **Standard ANSI SQL**:
  ```sql
  DELETE FROM users WHERE id = '65d1f89e2c4a1b0012e4f5a1';
  -- Cascade foreign keys automatically purge dependent rows:
  -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  await Donor.deleteMany({ user_id });
  const hospital = await Hospital.findOne({ user_id });
  if (hospital) {
    await BloodInventory.deleteMany({ hospital_id: hospital._id });
    await BloodRequest.deleteMany({ hospital_id: hospital._id });
    await Hospital.findByIdAndDelete(hospital._id);
  }
  await User.findByIdAndDelete(user_id);
  ```

---

#### Query 8: Triage Request Status Transition
- **Relational Algebra**:
  $$\text{UPDATE } \text{BLOOD\_REQUEST} \text{ SET } \text{status} = \text{'fulfilled'}, \text{updated\_at} = \text{NOW}() \text{ WHERE } \text{request\_id} = r$$
- **Standard ANSI SQL**:
  ```sql
  UPDATE blood_requests
  SET status = 'fulfilled', updated_at = NOW()
  WHERE id = '65d1f89e2c4a1b0012e4f5a9';
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const req = await BloodRequest.findByIdAndUpdate(
    request_id,
    { status: 'fulfilled' },
    { new: true }
  );
  ```

---

#### Query 9: User Directory Multi-Attribute Pagination & Search
- **Relational Algebra**:
  $$\pi_{\text{user\_id}, \text{name}, \text{email}, \text{role}, \text{created\_at}}(\sigma_{\text{role} = \text{'donor'}}(\text{USER}))$$
- **Standard ANSI SQL**:
  ```sql
  SELECT id, name, email, role, created_at
  FROM users
  WHERE role = 'donor'
  ORDER BY created_at DESC
  LIMIT 50 OFFSET 0;
  ```
- **MongoDB Mongoose Query**:
  ```javascript
  const users = await User.find({ role: 'donor' })
    .select('-password_hash')
    .sort({ created_at: -1 })
    .limit(50);
  ```

---

## End-to-End Business Processes

### 1. User Onboarding and Role Segregation
```mermaid
graph TD
    A["Visitor Lands on LifeLink"] --> B{"Select Role"}
    B -->|Donor| C["Fill Donor Registration Form"]
    B -->|Hospital| D["Fill Hospital Registration Form"]
    
    C --> E["1. POST /users creates User Account<br/>2. POST /users/:id/donor creates Donor Profile"]
    D --> F["1. POST /users creates User Account<br/>2. POST /users/:id/hospital creates Hospital Profile"]
    
    E --> G["Redirect to Donor Dashboard"]
    F --> H["Redirect to Hospital Blood Bank Management"]
```

### 2. Hospital Blood Bank Stock Management
1. **Matrix Initialization**: Hospitals query `GET /hospitals/:id/blood-bank`. The backend guarantees an 8-slot response representing `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` (with `0` units if not yet explicitly stocked).
2. **Stock Increment/Decrement**: Hospital managers edit units for specific blood types via `PUT /hospitals/:id/blood-bank`.
3. **Upsert Logic**: MongoDB automatically updates the record or creates a new entry using the compound unique index `{ hospital_id: 1, blood_group: 1 }`.

### 3. Emergency Request Triage and Dispatch
1. **Urgency Classification**:
   - `normal`: Standard elective transfusion or scheduled surgery preparation.
   - `urgent`: Timed requirement needed within 12-24 hours.
   - `emergency`: Immediate trauma or ICU life-support requirement.
2. **Broadcast Trigger**: Sending a `POST /blood-requests` immediately marks the request as `searching` and makes it discoverable by matching donors.

### 4. Donor Matching and Response Workflow
1. **Radar Discovery**: When a donor logs into their dashboard, the system calls `GET /blood-requests/donor/:donor_id`.
2. **Compatibility Query**: The backend queries all active requests matching the donor's blood group and joins hospital contact information (`hospital_name`, `hospital_phone`, `emergency_contact`, `hospital_address`, and coordinates).
3. **Direct Contact**: Donors can view the distance, open hospital navigation coordinates, or call the 24/7 hotline directly.

### 5. Administrative Oversight and Moderation
1. **Global Visibility**: Administrators have full access to view, search, and filter all registered users, active donors, verified hospitals, and platform analytics.
2. **Auditing and Moderation**: In case of duplicate profiles, deactivated medical centers, or fraudulent entries, administrators can execute deletions with automatic cascade cleanup.

---

## Complete RESTful API Specification

Base URL: `http://127.0.0.1:8000` (or `/api/v1`)

### Authentication and Session
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticate user with email and password | `{ "email": "...", "password": "..." }` | `200 OK` / `401 Unauthorized` |
| `GET` | `/` | System health check and API version info | _None_ | `200 OK` |

### User Management
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users` | Create base user record | `{ "name": "...", "email": "...", "password_hash": "...", "role": "donor\|hospital" }` | `200 OK` / `400 Bad Request` |
| `GET` | `/users` | Retrieve all registered users (excluding password) | _None_ | `200 OK` |
| `GET` | `/users/:user_id` | Retrieve single user profile by ID | _None_ | `200 OK` / `404 Not Found` |
| `DELETE` | `/users/:user_id` | **Cascade delete** user, profile, inventory, and requests | _None_ | `200 OK` / `404 Not Found` |

### Donor Management
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users/:user_id/donor` | Attach donor profile to existing user | `{ "blood_group": "O+", "phone": "...", "latitude": 40.71, "longitude": -74.00, "availability": true }` | `200 OK` / `400 Bad Request` |
| `GET` | `/donors` | Retrieve all donor profiles | _None_ | `200 OK` |
| `GET` | `/donors/:donor_id` | Retrieve single donor profile | _None_ | `200 OK` / `404 Not Found` |
| `PUT` | `/donors/:donor_id` | Update donor availability, phone, or location | `{ "availability": false, "last_donation_date": "2026-08-20" }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/donors/:donor_id` | Delete donor profile | _None_ | `200 OK` / `404 Not Found` |

### Hospital Management and Blood Bank
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users/:user_id/hospital` | Attach hospital profile to existing user | `{ "hospital_name": "...", "phone": "...", "emergency_contact": "...", "latitude": 40.71, "longitude": -74.00, "address": "..." }` | `200 OK` / `400 Bad Request` |
| `GET` | `/hospitals` | Retrieve all registered hospitals | _None_ | `200 OK` |
| `GET` | `/hospitals/:hospital_id` | Retrieve single hospital details | _None_ | `200 OK` / `404 Not Found` |
| `PUT` | `/hospitals/:hospital_id` | Update hospital contact information or address | `{ "emergency_contact": "+1-555-0911" }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/hospitals/:hospital_id` | Cascade delete hospital, inventory, and requests | _None_ | `200 OK` / `404 Not Found` |
| `GET` | `/hospitals/:hospital_id/blood-bank` | Retrieve 8-group stock matrix for hospital | _None_ | `200 OK` |
| `PUT` | `/hospitals/:hospital_id/blood-bank` | Upsert blood stock units for a blood group | `{ "blood_group": "A+", "units": 15 }` | `200 OK` / `400 Bad Request` |

### Blood Requests and Emergency Matching
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/blood-requests` | Broadcast new blood request | `{ "hospital_id": "...", "blood_group": "O-", "units_required": 3, "urgency": "emergency", "patient_name": "...", "required_by": "..." }` | `200 OK` / `400 Bad Request` |
| `GET` | `/blood-requests/hospital/:hospital_id` | List all requests issued by a hospital | _None_ | `200 OK` |
| `GET` | `/blood-requests/donor/:donor_id` | **Smart Match**: List requests matching donor's blood type enriched with hospital details | _None_ | `200 OK` |
| `GET` | `/blood-requests/:request_id` | Retrieve single blood request | _None_ | `200 OK` / `404 Not Found` |
| `PUT` | `/blood-requests/:request_id` | Update request status, units, or urgency | `{ "status": "fulfilled" }` | `200 OK` / `400 Bad Request` |
| `DELETE` | `/blood-requests/:request_id` | Delete blood request | _None_ | `200 OK` / `404 Not Found` |

### System Analytics
| Method | Endpoint | Description | Response Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/stats` | Platform totals (users, donors, hospitals, requests, stock by group) | `200 OK` |

---

## Database Schema and Indexing Strategy

To guarantee millisecond latency under high concurrency, MongoDB indexes are defined as follows:

| Collection | Index Key | Type / Constraint | Rationale |
| :--- | :--- | :--- | :--- |
| `users` | `{ email: 1 }` | Unique Index | Enforces unique email constraint and speeds up login lookups. |
| `donors` | `{ user_id: 1 }` | Unique Index | 1:1 relation constraint between User and Donor profile. |
| `donors` | `{ blood_group: 1, availability: 1 }` | Compound Index | Optimizes emergency donor discovery query. |
| `hospitals` | `{ user_id: 1 }` | Unique Index | 1:1 relation constraint between User and Hospital profile. |
| `hospitals` | `{ phone: 1 }` | Unique Index | Prevents duplicate hospital contact registrations. |
| `blood_inventory` | `{ hospital_id: 1, blood_group: 1 }` | Unique Compound | Ensures exactly 1 inventory record per blood type per hospital. |
| `blood_requests` | `{ hospital_id: 1, created_at: -1 }` | Compound Index | Speeds up hospital dashboard request history sorting. |
| `blood_requests` | `{ blood_group: 1, status: 1 }` | Compound Index | High-speed matching for donor radar. |

---

## Blood Compatibility Reference Matrix

| Recipient Blood Group | Compatible Donor Blood Groups (Can Receive From) | Can Donate To |
| :--- | :--- | :--- |
| **O-** *(Universal Red Cell Donor)* | `O-` | `O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+` (All) |
| **O+** | `O-`, `O+` | `O+`, `A+`, `B+`, `AB+` |
| **A-** | `O-`, `A-` | `A-`, `A+`, `AB-`, `AB+` |
| **A+** | `O-`, `O+`, `A-`, `A+` | `A+`, `AB+` |
| **B-** | `O-`, `B-` | `B-`, `B+`, `AB-`, `AB+` |
| **B+** | `O-`, `O+`, `B-`, `B+` | `B+`, `AB+` |
| **AB-** | `O-`, `A-`, `B-`, `AB-` | `AB-`, `AB+` |
| **AB+** *(Universal Recipient)* | `O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+` (All) | `AB+` |

---

## Installation and Setup Guide

### Prerequisites
- **Node.js**: Version `18.x` or `20.x+`
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or **MongoDB Atlas** connection URI.

---

### Backend Configuration and Execution

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/Configure your `.env` file:
   ```env
   PORT=8000
   NODE_ENV=development
   MONGODB_URL=mongodb://127.0.0.1:27017/lifelink
   CLIENT_URL=http://localhost:5173
   ```

4. Start the backend server:
   ```bash
   # Development with auto-reload:
   npm run dev

   # Production mode:
   npm start
   ```
   *The backend will be live at `http://127.0.0.1:8000/`.*

---

### Frontend Configuration and Execution

1. Open a separate terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173/`.*

---

## Project Directory Structure

```
DBMS/
├── package.json                  # Root orchestration and convenience scripts
├── README.md                     # Architecture, ER diagrams, and project documentation
│
├── backend/                      # Node.js + MongoDB RESTful API
│   ├── package.json              # Express, Mongoose, Helmet, Cors
│   ├── server.js                 # Server entry point & graceful shutdown
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Local environment configuration
│   └── src/
│       ├── app.js                # Express app initialization & middleware stack
│       ├── config/
│       │   ├── db.js             # Mongoose connection & lifecycle events
│       │   └── env.js            # Environment validation & configuration
│       ├── models/
│       │   ├── User.js           # User schema & JSON transformer
│       │   ├── Donor.js          # Donor profile & geolocation schema
│       │   ├── Hospital.js       # Hospital schema & contact definitions
│       │   ├── BloodInventory.js # 8-group stock schema with compound uniqueness
│       │   ├── BloodRequest.js   # Emergency blood request & triage schema
│       │   └── Notification.js   # Notification logs
│       ├── controllers/
│       │   ├── authController.js         # Login & auth validation
│       │   ├── userController.js         # User CRUD & cascade deletion
│       │   ├── donorController.js        # Donor profiles & matching queries
│       │   ├── hospitalController.js     # Hospital records & directory
│       │   ├── bloodBankController.js    # 8-group matrix generation & upsert
│       │   ├── bloodRequestController.js # Triage request creation & smart match
│       │   └── analyticsController.js    # Aggregated platform statistics
│       ├── routes/
│       │   ├── authRoutes.js             # /login
│       │   ├── userRoutes.js             # /users
│       │   ├── donorRoutes.js            # /donors
│       │   ├── hospitalRoutes.js         # /hospitals
│       │   ├── bloodRequestRoutes.js     # /blood-requests
│       │   ├── analyticsRoutes.js        # /analytics
│       │   └── index.js                  # Route aggregator
│       └── middlewares/
│           └── errorMiddleware.js        # Global error & CastError transformer
│
└── frontend/                     # Modern React + Vite + TypeScript Client
    ├── package.json              # Dependencies (React, Lucide, Framer Motion, Tailwind)
    ├── vite.config.ts            # Vite build configuration
    ├── tailwind.config.js        # Design tokens & responsive theme
    ├── index.html                # Single-page application template
    └── src/
        ├── App.tsx               # Client routes & layout hierarchy
        ├── main.tsx              # React DOM root
        ├── index.css             # Global Tailwind directives & custom CSS
        ├── lib/                  # Centralized API client & session helpers
        ├── context/              # Toast & AuthModal context providers
        ├── components/           # Reusable UI component atoms & modules
        │   ├── ui/               # Card, Badge, StatCard, EmptyState
        │   ├── common/           # Navbar, Footer, PageHeader, MobileAppBanner
        │   ├── auth/             # LoginModal, RegisterModal (Modal-driven authentication)
        │   ├── donor/            # DonorRequestCard, AvailabilityToggle
        │   ├── hospital/         # BloodMatrixGrid, CreateRequestModal
        │   └── admin/            # DataTable
        ├── pages/                # Domain-structured application views
        │   ├── index.ts          # Barrel export aggregator
        │   ├── public/           # LandingPage, NotFoundPage
        │   ├── donor/            # DonorDashboard, MatchRadar, Profile, History, Notifications, Settings
        │   ├── hospital/         # HospitalDashboard, BloodBankStock, BloodRequests
        │   └── admin/            # AdminLogin, AdminDashboard, AdminManagement
        └── types/                # TypeScript interface definitions
```

---

## Future Scope and Comprehensive Roadmap (Final Review)

To extend the system beyond the current production baseline, the following enterprise features and roadmap items are slated for upcoming releases:

```mermaid
flowchart LR
    subgraph Phase1["Phase 1: Mobile and Real-time Core"]
        P1A["Cross-Platform Native App (iOS & Android)"]
        P1B["FCM Emergency Push Beacon System"]
        P1C["Offline-First Cache & Sync Engine"]
    end

    subgraph Phase2["Phase 2: Predictive Intelligence"]
        P2A["AI/ML Shortage Forecasting (ARIMA / LSTM)"]
        P2B["Smart Donor Transfusion Eligibility"]
        P2C["Twilio & WhatsApp Interactive Gateway"]
    end

    subgraph Phase3["Phase 3: Hardware & Logistics"]
        P3A["IoT Cold-Chain RFID Refrigerator Tracking"]
        P3B["Hyperledger Transfusion Ledger"]
        P3C["Autonomous Medical Drone Transit Mesh"]
    end

    subgraph Phase4["Phase 4: National Integration"]
        P4A["HL7 FHIR v4.0 EHR Medical Gateway"]
        P4B["Inter-Hospital Regional Transit Grid"]
    end

    Phase1 --> Phase2 --> Phase3 --> Phase4
```

### 1. Cross-Platform Native Mobile Application (iOS & Android)
- **Native Experience**: Native client built with **React Native / Flutter** for high performance and native hardware sensor integration.
- **Push Notification Beacon**: Push alerts with high-priority audio chime for urgent and emergency blood requests powered by **Firebase Cloud Messaging (FCM)** and Apple APNs.
- **Live Background Geolocation Tracking**: Dynamic proximity recalculation when donors move within a 10km to 25km radius of emergency hospitals.
- **One-Tap Emergency SOS**: Emergency responders and hospital dispatchers can broadcast a localized SOS alert to nearby donors in under 5 seconds.
- **Offline-First Synchronization**: Local SQLite / WatermelonDB cache allowing donors to browse blood requests and view donation history without an active internet connection.

### 2. AI and Machine Learning Predictive Analytics
- **Regional Blood Shortage Forecasting**: Time-series predictive models (**ARIMA / LSTM**) that ingest historical transfusion patterns, surgical schedules, seasonal illness spikes, and holiday road traffic incidents to forecast blood shortages 14 days in advance.
- **Intelligent Donor Cooldown Optimization**: Automated scoring algorithm tracking individual hemoglobin recovery rates and personalized notification triggers when donors become eligible after the standard 90-day cooldown period.
- **Automated Triage Prioritization**: NLP-assisted extraction from clinical notes to automatically prioritize blood requests based on patient trauma severity.

### 3. Automated Multi-Channel Emergency Dispatch (SMS and WhatsApp)
- **Twilio and WhatsApp Business API**: Instant dispatch of emergency blood alerts to donors without requiring active web or app sessions.
- **Interactive Two-Way SMS Response**: Donors can reply directly with `ACCEPT <REQUEST_CODE>` or `BUSY` to confirm their availability via SMS or WhatsApp chatbots.

### 4. IoT Smart Cold-Chain and RFID Blood Bag Monitoring
- **RFID Tracking**: Real-time RFID tag integration for every collected blood unit from donation to laboratory separation to hospital storage.
- **Cold-Chain Temperature Telemetry**: IoT temperature and humidity sensors in storage refrigerators that trigger immediate alerts if temperatures deviate from optimal ranges (2°C - 6°C for RBCs, -18°C for plasma).
- **Automated Expiry and Wastage Prevention**: Intelligent shelf-life tracking that prioritizes older units for upcoming elective surgeries, reducing blood wastage to near zero.

### 5. Blockchain-Backed Blood Provenance and Chain of Custody
- **Immutable Transfusion Ledger**: Distributed ledger technology (**Hyperledger Fabric**) recording every stage of blood unit handling (screening, infectious disease testing, component separation, transit, cross-matching, transfusion).
- **Anti-Counterfeit Verification**: QR code on physical blood units enabling patients and surgeons to verify origin, pathogen clearance, and authenticity before transfusion.

### 6. National Health Stack and EHR Interoperability (HL7 / FHIR)
- **Seamless EHR Integration**: Implementation of **HL7 FHIR v4.0** APIs allowing direct bi-directional integration with Hospital Information Systems (Epic, Cerner, Allscripts).
- **National Blood Donor Registry Sync**: Interoperability with government health databases and regional transfusion councils for cross-state donor verification.

### 7. Autonomous Drone Delivery and Medical Transit Mesh
- **Rapid Transit Integration**: API integration with medical logistics drones (e.g., Zipline / Wingcopter) for dispatching rare blood units (such as `O-` or `AB-`) across congested urban areas or isolated rural healthcare centers in critical emergency windows.

---

## License and Acknowledgments

This project is licensed under the **MIT License**.