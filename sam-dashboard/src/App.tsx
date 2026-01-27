import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, ProtectedRoute } from './auth';
import { ScrollToTop } from './components/catalyst';
import { RootFrame } from './components/catalyst/layout';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  MfaSetupPage,
  OAuthCallbackPage,
} from './pages';
import { Dashboard } from './Dashboard';

function App() {
  return (
    <HelmetProvider>
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
    </HelmetProvider>
  );
}

export default App;
