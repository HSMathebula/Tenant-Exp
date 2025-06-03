import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./contexts/AuthContext"
import { SnackbarProvider } from "notistack"
import './styles/global.css';

// Pages
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from './pages/auth/RegisterPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import DashboardPage from "./pages/admin/DashboardPage"
import TicketsPage from "./pages/admin/TicketsPage"
import TicketDetailPage from "./pages/admin/TicketDetailPage"
import TenantsPage from "./pages/admin/TenantsPage"
import ReportsPage from "./pages/admin/ReportsPage"
import { PropertiesPage } from "./pages/admin/PropertiesPage"
import AnnouncementsPage from "./pages/admin/AnnouncementsPage"
import SettingsPage from "./pages/admin/SettingsPage"

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeProvider>
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          style={{
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
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
                  <Route path="properties" element={<PropertiesPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
