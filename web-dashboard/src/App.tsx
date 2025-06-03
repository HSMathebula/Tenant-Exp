import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./contexts/AuthContext"
import { SnackbarProvider } from "notistack"

// Pages
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from './pages/auth/RegisterPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import DashboardPage from "./pages/admin/DashboardPage"
import TicketsPage from "./pages/admin/TicketsPage"
import TicketDetailPage from "./pages/admin/TicketDetailPage"
import TenantsPage from "./pages/admin/TenantsPage"

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="tickets" element={<TicketsPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="tenants" element={<TenantsPage />} />
              </Route>

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
