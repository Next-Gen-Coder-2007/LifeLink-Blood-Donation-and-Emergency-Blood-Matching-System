import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { getSession } from "@/lib/api";
import { AuthModalProvider, useAuthModal } from "@/context/AuthModalContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { RegisterModal } from "@/components/auth/RegisterModal";

import {
  LandingPage,
  NotFoundPage,
  DonorDashboard,
  DonorBloodRequests,
  DonorProfilePage,
  DonationHistoryPage,
  NotificationsPage,
  HospitalDashboard,
  HospitalBloodBank,
  HospitalBloodRequests,
  HospitalDonorsMapPage,
  HospitalSettingsPage,
  AdminLoginPage,
  AdminDashboard,
  AdminManagementPage,
} from "@/pages";

function DashboardRedirect() {
  const session = getSession();
  if (!session) return <Navigate to="/" replace />;
  if (session.user.role === "hospital") return <Navigate to="/hospital/dashboard" replace />;
  if (session.user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/donor/dashboard" replace />;
}

function ModalRouteTrigger({ type, tab = "donor" }: { type: "login" | "register"; tab?: "donor" | "hospital" }) {
  const { openLogin, openRegister } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (type === "login") openLogin();
    else openRegister(tab);
    navigate("/", { replace: true });
  }, [type, tab, openLogin, openRegister, navigate]);

  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      <Navbar />
      <main className="flex-1 pb-12">{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <LoginModal />
      <RegisterModal />

      <Routes>
        {/* Public Marketing Route */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />

        {/* Modal Auth Triggers */}
        <Route path="/login" element={<ModalRouteTrigger type="login" />} />
        <Route path="/register" element={<ModalRouteTrigger type="register" tab="donor" />} />
        <Route path="/register/donor" element={<ModalRouteTrigger type="register" tab="donor" />} />
        <Route path="/register/hospital" element={<ModalRouteTrigger type="register" tab="hospital" />} />

        {/* Intelligent Role Redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Donor Operations */}
        <Route path="/donor/dashboard" element={<AppLayout><DonorDashboard /></AppLayout>} />
        <Route path="/donor/requests" element={<AppLayout><DonorBloodRequests /></AppLayout>} />
        <Route path="/donor/profile" element={<AppLayout><DonorProfilePage /></AppLayout>} />
        <Route path="/donor/settings" element={<AppLayout><DonorProfilePage /></AppLayout>} />
        <Route path="/donor/history" element={<AppLayout><DonationHistoryPage /></AppLayout>} />
        <Route path="/donor/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
        <Route path="/donor/map" element={<AppLayout><HospitalDonorsMapPage /></AppLayout>} />
        <Route path="/map" element={<AppLayout><HospitalDonorsMapPage /></AppLayout>} />

        {/* Hospital Operations */}
        <Route path="/hospital/dashboard" element={<AppLayout><HospitalDashboard /></AppLayout>} />
        <Route path="/hospital/blood-bank" element={<AppLayout><HospitalBloodBank /></AppLayout>} />
        <Route path="/hospital/requests" element={<AppLayout><HospitalBloodRequests /></AppLayout>} />
        <Route path="/hospital/settings" element={<AppLayout><HospitalSettingsPage /></AppLayout>} />
        <Route path="/hospital/profile" element={<AppLayout><HospitalSettingsPage /></AppLayout>} />
        <Route path="/hospital/map" element={<AppLayout><HospitalDonorsMapPage /></AppLayout>} />
        <Route path="/hospital/donors-map" element={<AppLayout><HospitalDonorsMapPage /></AppLayout>} />

        {/* Admin Operations */}
        <Route path="/admin/login" element={<AppLayout><AdminLoginPage /></AppLayout>} />
        <Route path="/admin/dashboard" element={<AppLayout><AdminDashboard /></AppLayout>} />
        <Route path="/admin/users" element={<AppLayout><AdminManagementPage type="users" /></AppLayout>} />
        <Route path="/admin/donors" element={<AppLayout><AdminManagementPage type="donors" /></AppLayout>} />
        <Route path="/admin/hospitals" element={<AppLayout><AdminManagementPage type="hospitals" /></AppLayout>} />
        <Route path="/admin/requests" element={<AppLayout><AdminManagementPage type="requests" /></AppLayout>} />
        <Route path="/admin/certificates" element={<AppLayout><AdminManagementPage type="certificates" /></AppLayout>} />

        {/* 404 Fallback */}
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthModalProvider>
      <AppRoutes />
    </AuthModalProvider>
  );
}
