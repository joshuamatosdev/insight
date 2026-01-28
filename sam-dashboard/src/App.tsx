import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {AuthProvider, ProtectedRoute} from './auth';
import {ScrollToTop} from './components/catalyst';
import {RootFrame} from './components/catalyst/layout';
import {
  ForgotPasswordPage,
  LoginPage,
  MfaSetupPage,
  OAuthCallbackPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from './pages';

import Dashboard from "@/app/Dashboard.tsx";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <RootFrame>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

            {/* Protected routes */}
            <Route
              path="/mfa-setup"
              element={
                <ProtectedRoute>
                  <MfaSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RootFrame>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
