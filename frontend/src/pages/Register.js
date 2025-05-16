import React, { useState } from 'react';
import '../styles/Register.css';
import { registerUser } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName) errors.fullName = "Full Name is required.";
    if (!formData.email) errors.email = "Email is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword) 
      errors.confirmPassword = "Passwords do not match.";
    if (!formData.school) errors.school = "Please select a school.";

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await registerUser(formData);
        alert("Registration Successful!");
        console.log('Server Response:', response);
      } catch (error) {
        alert("Registration Failed. Please try again.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register as an Alumni</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="fullName" 
          placeholder="Full Name" 
          value={formData.fullName} 
          onChange={handleChange} 
        />
        {errors.fullName && <p className="error">{errors.fullName}</p>}
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
        />
        {errors.email && <p className="error">{errors.email}</p>}
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
        />
        {errors.password && <p className="error">{errors.password}</p>}
        
        <input 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm Password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
        
        <select 
          name="school" 
          value={formData.school} 
          onChange={handleChange} 
        >
          <option value="">Select School</option>
          <option value="Business School">Business School</option>
          <option value="Engineering School">Engineering School</option>
          <option value="IT School">IT School</option>
          <option value="Arts School">Arts School</option>
        </select>
        {errors.school && <p className="error">{errors.school}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;