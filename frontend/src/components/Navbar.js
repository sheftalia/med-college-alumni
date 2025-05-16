import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { userRole, isLoggedIn, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <h2>Mediterranean College Alumni</h2>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>

        {!isLoggedIn && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}

        {isLoggedIn && userRole === "Admin" && (
          <li><Link to="/admin">Admin Panel</Link></li>
        )}

        {isLoggedIn && userRole === "Alumni" && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
          </>
        )}

        {isLoggedIn && (
          <li>
            <button className="logout-button" onClick={logout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;