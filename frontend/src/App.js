import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';  // <== Navbar should be imported here
import PrivateRoute from './components/PrivateRoute';
import './App.css';  // <== Make sure you import your CSS here

const App = () => {
  return (
    <Router>
      <Navbar /> {/* This should be above the Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/events" 
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } 
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;