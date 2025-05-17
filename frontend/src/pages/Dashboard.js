import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const firstName = user?.first_name || 'Alumni';

  return (
    <div className="dashboard-container">
      <h2>Welcome, {firstName}</h2>
      <p>This is your dashboard where you can connect with fellow graduates and see what's happening in our community.</p>

      <div className="dashboard-tiles">
        <Link to="/profile" className="dashboard-tile">
          <div className="tile-icon">👤</div>
          <h3>My Profile</h3>
          <p>View and update your alumni profile information.</p>
        </Link>

        <Link to="/alumni" className="dashboard-tile">
          <div className="tile-icon">👥</div>
          <h3>Alumni Directory</h3>
          <p>Browse and connect with other Mediterranean College alumni.</p>
        </Link>

        <Link to="/events" className="dashboard-tile">
          <div className="tile-icon">📅</div>
          <h3>Events</h3>
          <p>Discover upcoming alumni events and opportunities.</p>
        </Link>

        <Link to="/messages" className="dashboard-tile">
          <div className="tile-icon">✉️</div>
          <h3>Messages</h3>
          <p>Communicate with fellow alumni and stay connected.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;