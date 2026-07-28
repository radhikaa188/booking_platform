import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected User Routes */}
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div>Profile TODO</div>
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* Error Pages */}
          <Route path="/unauthorized" element={<div>Unauthorized TODO</div>} />
          <Route path="/404" element={<div>404 TODO</div>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
