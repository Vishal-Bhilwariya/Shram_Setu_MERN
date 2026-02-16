import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import JobListing from './pages/JobListing';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import MyApplications from './pages/MyApplications';
import WorkerDashboard from './pages/WorkerDashboard';
import HirerDashboard from './pages/HirerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected: Any authenticated user */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><JobListing /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />

              {/* Worker Routes */}
              <Route path="/worker-dashboard" element={<ProtectedRoute roles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
              <Route path="/my-applications" element={<ProtectedRoute roles={['worker']}><MyApplications /></ProtectedRoute>} />

              {/* Hirer Routes */}
              <Route path="/my-jobs" element={<ProtectedRoute roles={['hirer']}><HirerDashboard /></ProtectedRoute>} />
              <Route path="/post-job" element={<ProtectedRoute roles={['hirer']}><PostJob /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
