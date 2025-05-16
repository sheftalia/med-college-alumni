import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate(); // For navigation

  return (
    <div className="dashboard-container">
      <h2>Welcome to Your Alumni Dashboard</h2>
      <p>Here you can manage your profile, view events, and connect with fellow alumni.</p>

      <div className="dashboard-sections">
        <div className="dashboard-item" onClick={() => navigate('/profile')}>
          <h3>My Profile</h3>
          <p>View and edit your alumni profile.</p>
        </div>

        <div className="dashboard-item" onClick={() => navigate('/events')}>
          <h3>Events</h3>
          <p>Discover upcoming alumni events and networking opportunities.</p>
        </div>

        <div className="dashboard-item" onClick={() => navigate('/messages')}>
          <h3>Messages</h3>
          <p>Connect and communicate with your alumni network.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;