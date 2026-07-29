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
import Profile from "./pages/Profile";
import BookingSuccess from "./pages/BookingSuccess";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public Routes */}
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
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/booking-success" element={
              <ProtectedRoute>
                <BookingSuccess />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback & Error Handling */}
          <Route path="/unauthorized" element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
              <p className="text-slate-500 mb-6">You do not have permission to view this page.</p>
              <a href="/" className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg">Return Home</a>
            </div>
          } />
          <Route path="/404" element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
              <p className="text-slate-500 mb-6">Page not found.</p>
              <a href="/" className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg">Return Home</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
