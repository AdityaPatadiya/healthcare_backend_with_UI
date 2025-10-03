import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.profile?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Healthcare System</Link>
      </div>

      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-item">Dashboard</Link>
        <Link to="/patients" className="navbar-item">Patients</Link>
        <Link to="/doctors" className="navbar-item">Doctors</Link>
        <Link to="/mappings" className="navbar-item">Mappings</Link>

        {/* Admin-only links */}
        {isAdmin && (
          <>
            <Link to="/users" className="navbar-item admin-only">Users</Link>
            <Link to="/reports" className="navbar-item admin-only">Reports</Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span>Welcome, {user?.username}</span>
        {isAdmin && <span className="admin-badge">Admin</span>}
        <span className="user-role">({user?.profile?.role})</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
