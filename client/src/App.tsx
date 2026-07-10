import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { pingVisit } from "./api/visits.api";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { ReferralPage } from "./pages/ReferralPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CourseContentPage } from "./pages/CourseContentPage";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { AdminTopicsPage } from "./pages/admin/AdminTopicsPage";
import { AdminMaterialsPage } from "./pages/admin/AdminMaterialsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminVisitsPage } from "./pages/admin/AdminVisitsPage";

export default function App() {
  useEffect(() => {
    if (sessionStorage.getItem("visited")) return;
    sessionStorage.setItem("visited", "1");
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitorId", visitorId);
    }
    pingVisit(visitorId).catch(() => {});
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <Navbar />
        <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/courses/:slug" element={<CourseContentPage />} />
            <Route path="/dashboard/courses/:slug/topics/:topicId" element={<CourseContentPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/courses" replace />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/courses/:id/topics" element={<AdminTopicsPage />} />
            <Route path="/admin/topics/:id/materials" element={<AdminMaterialsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/visits" element={<AdminVisitsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </HashRouter>
  );
}
