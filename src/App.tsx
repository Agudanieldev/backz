import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import {
  AdminRoute,
  ProtectedRoute,
  RootRedirect,
  UserRoute,
} from "@/components/layout/guards";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import AuthConfirmPage from "@/pages/AuthConfirmPage";
import DashboardPage from "@/pages/DashboardPage";
import InvestPage from "@/pages/InvestPage";
import ToolsPage from "@/pages/ToolsPage";
import AdminPage from "@/pages/AdminPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/confirm" element={<AuthConfirmPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route element={<UserRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/invest" element={<InvestPage />} />
                <Route path="/tools" element={<ToolsPage />} />
              </Route>

              <Route
                path="/forex"
                element={<Navigate to="/tools?tab=forex" replace />}
              />
              <Route
                path="/crypto"
                element={<Navigate to="/tools?tab=crypto" replace />}
              />
              <Route
                path="/stocks"
                element={<Navigate to="/tools?tab=stocks" replace />}
              />

              <Route path="/profile" element={<ProfilePage />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
