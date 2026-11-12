import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// All 10 Website Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { ChatDashboardPage } from './pages/ChatDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 1. Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* 2. Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* 3. Registration Page */}
            <Route path="/register" element={<RegisterPage />} />

            {/* 4. Forgot Password Page */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* 5. Reset Password Page */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* 6. Email Verification Page */}
            <Route path="/verify-email" element={<EmailVerificationPage />} />

            {/* 7. AI Chat Dashboard */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <ProtectedRoute>
                  <ChatDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 8. User Profile Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 9. Settings Page */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* 10. 404 Page */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

