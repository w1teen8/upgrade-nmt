import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CourseContentPage } from "./pages/CourseContentPage";
import { PaymentResultPage } from "./pages/PaymentResultPage";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { AdminTopicsPage } from "./pages/admin/AdminTopicsPage";
import { AdminMaterialsPage } from "./pages/admin/AdminMaterialsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/courses/:slug" element={<CourseContentPage />} />
            <Route path="/payment/result" element={<PaymentResultPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/courses" replace />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/courses/:id/topics" element={<AdminTopicsPage />} />
            <Route path="/admin/topics/:id/materials" element={<AdminMaterialsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
