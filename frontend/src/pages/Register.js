import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, getSchoolsAndCourses } from '../services/api';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchoolsAndCourses = async () => {
      try {
        const data = await getSchoolsAndCourses();
        
        // Remove duplicates by using Set
        const uniqueSchools = Array.from(new Set(data.schools.map(s => s.id)))
          .map(id => data.schools.find(s => s.id === id));
        
        setSchools(uniqueSchools || []);
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Failed to fetch schools and courses', error);
      }
    };

    fetchSchoolsAndCourses();
  }, []);

  // Update filtered courses when school selection changes
  useEffect(() => {
    if (selectedSchool) {
      const schoolCourses = courses.filter(
        course => course.school_id === parseInt(selectedSchool)
      );
      setFilteredCourses(schoolCourses);
    } else {
      setFilteredCourses([]);
    }
  }, [selectedSchool, courses]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSchoolChange = (e) => {
    setSelectedSchool(e.target.value);
    // Clear any previously selected course
    setFormData({ ...formData, course_id: '' });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name) errors.first_name = "First Name is required.";
    if (!formData.last_name) errors.last_name = "Last Name is required.";
    if (!formData.email) errors.email = "Email is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword) 
      errors.confirmPassword = "Passwords do not match.";
    if (!selectedSchool) errors.school = "Please select a school.";
    if (selectedSchool && !formData.course_id) errors.course = "Please select a course.";

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const userData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          gender: formData.gender
        };
        
        await registerUser(userData);
        
        // Instead of alert, we'll set a success message to display in the form
        setSuccessMessage("Registration successful! Please login to continue.");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setErrors({ general: error.response?.data?.message || "Registration failed. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register as an Alumni</h2>
      <form onSubmit={handleSubmit}>
        {successMessage && (
          <div className="success-message">
            {successMessage}
            <button 
              type="button" 
              className="success-button"
              onClick={() => navigate('/login')}
            >
              OK
            </button>
          </div>
        )}
      
        <div className="form-row">
          <div className="form-group">
            <input 
              type="text" 
              name="first_name" 
              placeholder="First Name" 
              value={formData.first_name} 
              onChange={handleChange} 
              required
            />
            {errors.first_name && <p className="error">{errors.first_name}</p>}
          </div>
          
          <div className="form-group">
            <input 
              type="text" 
              name="last_name" 
              placeholder="Last Name" 
              value={formData.last_name} 
              onChange={handleChange} 
              required
            />
            {errors.last_name && <p className="error">{errors.last_name}</p>}
          </div>
        </div>
        
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
        
        <div className="form-group">
          <label>Gender:</label>
          <select
            name="gender" 
            value={formData.gender} 
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>School:</label>
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
          {errors.school && <p className="error">{errors.school}</p>}
        </div>
        
        {selectedSchool && (
          <div className="form-group">
            <label>Course:</label>
            <select 
              name="course_id" 
              value={formData.course_id} 
              onChange={handleChange} 
            >
              <option value="">Select Course</option>
              {filteredCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.course && <p className="error">{errors.course}</p>}
          </div>
        )}

        {errors.general && <p className="error">{errors.general}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="form-footer">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
};

export default Register;