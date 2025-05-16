import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getSchoolsAndCourses } from '../services/api';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchoolsAndCourses = async () => {
      try {
        const data = await getSchoolsAndCourses();
        setSchools(data.schools || []);
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Failed to fetch schools and courses', error);
      }
    };

    fetchSchoolsAndCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSchoolChange = (e) => {
    setSelectedSchool(e.target.value);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) errors.email = "Email is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword) 
      errors.confirmPassword = "Passwords do not match.";

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const userData = {
          email: formData.email,
          password: formData.password
        };
        
        await registerUser(userData);
        alert("Registration Successful! Please login to continue.");
        navigate('/login');
      } catch (error) {
        setErrors({ general: error.response?.data?.message || "Registration Failed. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCourses = courses.filter(
    course => course.school_id === parseInt(selectedSchool)
  );

  return (
    <div className="register-container">
      <h2>Register as an Alumni</h2>
      <form onSubmit={handleSubmit}>
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
          value={selectedSchool} 
          onChange={handleSchoolChange} 
        >
          <option value="">Select School</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>

        {errors.general && <p className="error">{errors.general}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;