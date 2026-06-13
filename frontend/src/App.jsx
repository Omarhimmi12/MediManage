import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { NotificationProvider } from "./context/notificationContext";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import MedecinDashboard from "./pages/dashboards/medecinDashboard";
import SecretaireDashboard from "./pages/dashboards/secretaireDashboard";
import PatientDashboard from "./pages/dashboards/patientDashboard";
import MessagingPage from "./pages/messaging/MessagingPage";
import ProtectedRoute from "./routes/protectedRoute";
import NotFound from "./pages/notFound";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Medecin */}
          <Route
            path="/medecin/*"
            element={
              <ProtectedRoute role="medecin">
                <MedecinDashboard />
              </ProtectedRoute>
            }
          />

          {/* Secretaire */}
          <Route
            path="/secretaire/*"
            element={
              <ProtectedRoute role="secretaire">
                <SecretaireDashboard />
              </ProtectedRoute>
            }
          />

          {/* Patient */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Messages (all roles) */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
