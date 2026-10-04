import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './components/RouteGuards.jsx';
import BusinessSetup from './pages/BusinessSetup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import OnboardingSuccess from './pages/OnboardingSuccess.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import SageConnection from './pages/SageConnection.jsx';
import Signup from './pages/Signup.jsx';

const guest = (el) => <GuestRoute>{el}</GuestRoute>;
// requireOnboarded={false}: these screens are part of onboarding itself.
const onboarding = (el) => <ProtectedRoute requireOnboarded={false}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={guest(<Login />)} />
      <Route path="/signup" element={guest(<Signup />)} />
      <Route path="/signup/role" element={guest(<RoleSelection />)} />
      <Route path="/signup/business" element={guest(<BusinessSetup />)} />
      <Route path="/forgot-password" element={guest(<ForgotPassword />)} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/onboarding" element={onboarding(<Onboarding />)} />
      <Route path="/onboarding/sage" element={onboarding(<SageConnection />)} />
      <Route path="/onboarding/success" element={<ProtectedRoute><OnboardingSuccess /></ProtectedRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={
          <main className="notfound">
            <h1>Page not found</h1>
            <p>The page you're looking for doesn't exist. <Link to="/dashboard">Go to your dashboard</Link></p>
          </main>
        }
      />
    </Routes>
  );
}
