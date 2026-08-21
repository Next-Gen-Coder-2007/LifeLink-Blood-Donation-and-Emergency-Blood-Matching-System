# LifeLink Mobile - Flutter Application 🩸

A medical-grade cross-platform Flutter application for the **LifeLink Blood Donation & Emergency Blood Matching System**.

---

## 📱 Features

- **Dual-Role Onboarding**: Intelligent login & registration for both **Volunteer Donors** and **Medical Facilities**.
- **Live Blood Matching Stream**: Real-time clinical ABO/Rh compatibility engine in Dart (`O-`, `O+`, `A+`, `B-`, etc.).
- **Geospatial Proximity Radar**: Haversine distance calculator with live emergency transit times.
- **1-Tap Donation Pledges**: Immediate dispatch of donation commitments with arrival ETAs.
- **Digital Donation Certificates**: Verification hash and verifiable certificate history.
- **Hospital Triage Desk**: Emergency broadcasts, blood inventory tracker, and 1-tap **Direct Clinical Directives** to nearby donors.
- **Real-Time Notification Hub**: Emergency alerts and broadcast push center.

---

## 🚀 Getting Started

### 1. Prerequisites
- Flutter SDK (>= 3.0.0)
- Android Studio / Xcode
- Node.js backend running on port 8000 (or deployed cloud URL)

### 2. Install Dependencies
```bash
cd mobile
flutter pub get
```

### 3. Run the App
```bash
# For Android Emulator:
flutter run

# For iOS Simulator:
flutter run

# For Web Browser:
flutter run -d chrome
```

---

## 🏗️ Architecture

```
mobile/lib/
├── config/             # Endpoints (ApiConfig) & Medical AppTheme
├── core/               # ABO/Rh Matching Engine & Haversine Distance Calculator
├── models/             # Strongly typed Dart data models
├── providers/          # Reactive MVVM Provider state management
├── screens/
│   ├── auth/           # Splash, Login, Donor/Hospital Registration
│   ├── donor/          # Match stream, Pledges, Certificates, Profile
│   ├── hospital/       # Broadcast creation, Inventory, Donor radar
│   └── common/         # Notifications center & Worldwide hospital radar
└── widgets/            # Reusable UI badges, pills, cards, and modal sheets
```
