import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Shram Setu</Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              {user.role === 'worker' && <Link to="/jobs" className="hover:text-blue-200">Jobs</Link>}
              {user.role === 'hirer' && <Link to="/post-job" className="hover:text-blue-200">Post Job</Link>}
              {user.role === 'admin' && <Link to="/admin" className="hover:text-blue-200">Admin</Link>}
              <span className="text-sm">Hi, {user.firstName}</span>
              <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
