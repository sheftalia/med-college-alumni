import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, isLoggedIn, logout, isAdmin, isRegisteredAlumni, isAppliedAlumni } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo-container">
          <img src="/images/logo.png" alt="MC Logo" className="logo" />
          <h1 className="title-font">MC Alumni</h1>
        </Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        
        {isLoggedIn && isRegisteredAlumni() && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
            <li><Link to="/alumni">Alumni Directory</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/messages">Messages</Link></li>
          </>
        )}

        {isLoggedIn && isAdmin() && (
          <>
            <li><Link to="/admin">Admin Panel</Link></li>
            <li><Link to="/alumni">Alumni Directory</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/messages">Messages</Link></li>
          </>
        )}

        {isLoggedIn && isAppliedAlumni() && (
          <li><Link to="/application-status">Application Status</Link></li>
        )}

        {!isLoggedIn && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}

        {isLoggedIn && (
          <li>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;