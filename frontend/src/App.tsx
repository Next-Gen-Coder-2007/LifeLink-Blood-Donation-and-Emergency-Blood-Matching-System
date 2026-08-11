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
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterSelectionPage />} />
        <Route path="/register/donor" element={<DonorRegisterPage />} />
        <Route path="/register/hospital" element={<HospitalRegisterPage />} />
        <Route
  path="/dashboard"
  element={<DashboardPage />}
/>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
