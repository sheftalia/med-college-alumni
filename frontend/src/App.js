import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Messages from './pages/Messages';
import AlumniDirectory from './pages/AlumniDirectory';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import ApplicationStatus from './pages/ApplicationStatus';
import AdminPanel from './pages/AdminPanel';
import './App.css';

const App = () => {
  const { isLoggedIn, loading, user, isAppliedAlumni } = useContext(AuthContext);

  // Custom private route component
  const PrivateRoute = ({ children, requiresProfile = true }) => {
    if (loading) {
      return <Loader loading={true} />;
    }
    
    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }
    
    if (requiresProfile && isAppliedAlumni()) {
      return <Navigate to="/application-status" />;
    }
    
    return children;
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route 
            path="/login" 
            element={
              isLoggedIn ? 
                (isAppliedAlumni() ? <Navigate to="/application-status" /> : <Navigate to="/dashboard" />) 
                : <Login />
            } 
          />
          
          <Route 
            path="/register" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />} 
          />

          {/* Profile page - accessible to all logged in users */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute requiresProfile={false}>
                <Profile />
              </PrivateRoute>
            } 
          />
          
          {/* Application Status for applied alumni */}
          <Route 
            path="/application-status" 
            element={
              <PrivateRoute requiresProfile={false}>
                <ApplicationStatus />
              </PrivateRoute>
            } 
          />
          
          {/* Admin Panel */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            } 
          />
          
          {/* Alumni profile view for individual profiles */}
          <Route 
            path="/profile/:id" 
            element={
              <PrivateRoute requiresProfile={false}>
                <Profile viewMode={true} />
              </PrivateRoute>
            } 
          />
          
          {/* Alumni Directory */}
          <Route 
            path="/alumni" 
            element={
              <PrivateRoute>
                <AlumniDirectory />
              </PrivateRoute>
            } 
          />
          
          {/* Events page */}
          <Route 
            path="/events" 
            element={<Events />} 
          />
          
          {/* Messages page - requires completed profile */}
          <Route 
            path="/messages" 
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            } 
          />
          
          {/* Dashboard - requires completed profile */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>Copyright © {new Date().getFullYear()} Mediterranean College Alumni Portal</p>
      </footer>
    </div>
  );
};

export default App;