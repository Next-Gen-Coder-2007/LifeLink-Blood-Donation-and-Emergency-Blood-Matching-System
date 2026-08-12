import { Routes, Route } from "react-router-dom";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterSelectionPage } from "@/pages/RegisterSelectionPage";
import { DonorRegisterPage } from "@/pages/DonorRegisterPage";
import { HospitalRegisterPage } from "@/pages/HospitalRegisterPage";

import { DonorDashboardPage } from "@/pages/DonarDashboard";

import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { Admin } from "@/pages/Admin";
import { AdminManagementPage } from "@/pages/AdminManagementPage";

import { NotFoundPage } from "@/pages/NotFoundPage";


export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route
          path="/"
          element={
            <div className="flex min-h-screen flex-col">
              <Navbar />

              <main className="flex-1">
                <LandingPage />
              </main>

              <Footer />
            </div>
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterSelectionPage />}
        />

        <Route
          path="/register/donor"
          element={<DonorRegisterPage />}
        />

        <Route
          path="/register/hospital"
          element={<HospitalRegisterPage />}
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        <Route
          path="/admin/dashboard"
          element={<Admin />}
        />

        {/* ================= ADMIN MANAGEMENT ================= */}

          <Route
            path="/admin/donors"
            element={<AdminManagementPage type="donors" />}
          />

          <Route
            path="/admin/hospitals"
            element={<AdminManagementPage type="hospitals" />}
          />

          <Route
            path="/admin/users"
            element={<AdminManagementPage type="users" />}
          />

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />


        <Route
          path="/donor/dashboard"
          element={<DonorDashboardPage />}
        />
        

      </Routes>
    </>
  );
}