import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHardHat, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `transition-colors font-medium ${isActive(path) ? 'text-indigo-300' : 'text-gray-200 hover:text-white'}`;

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white">
            <FaHardHat className="text-indigo-400 text-2xl" />
            <span className="text-xl font-bold tracking-tight">Shram Setu</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-xl p-2"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {user.role === 'worker' && (
                  <>
                    <Link to="/jobs" className={linkClass('/jobs')}>Browse Jobs</Link>
                    <Link to="/my-applications" className={linkClass('/my-applications')}>My Applications</Link>
                  </>
                )}
                {user.role === 'hirer' && (
                  <>
                    <Link to="/my-jobs" className={linkClass('/my-jobs')}>My Jobs</Link>
                    <Link to="/post-job" className={linkClass('/post-job')}>Post Job</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className={linkClass('/admin')}>Admin Panel</Link>
                )}
                <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-600">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {user.firstName?.[0]}
                  </div>
                  <span className="text-gray-300 text-sm">{user.firstName}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass('/login')}>Login</Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4 space-y-3">
            {user ? (
              <>
                {user.role === 'worker' && (
                  <>
                    <Link to="/jobs" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
                    <Link to="/my-applications" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>My Applications</Link>
                  </>
                )}
                {user.role === 'hirer' && (
                  <>
                    <Link to="/my-jobs" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>My Jobs</Link>
                    <Link to="/post-job" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>Post Job</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                )}
                <Link to="/profile" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="block text-red-400 hover:text-red-300">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-gray-200 hover:text-white" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
