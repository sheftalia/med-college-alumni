import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllAlumni, getSchoolsAndCourses } from '../services/api';
import Loader from '../components/Loader';
import '../styles/AlumniDirectory.css';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchName, setSearchName] = useState('');
  
  const location = useLocation();
  
  useEffect(() => {
    // Check for query parameters
    const queryParams = new URLSearchParams(location.search);
    const schoolId = queryParams.get('school');
    const courseId = queryParams.get('course');
    
    if (schoolId) {
      setSelectedSchool(schoolId);
    }
    
    if (courseId) {
      setSelectedCourse(courseId);
    }
    
    fetchData();
  }, [location]);
  
  useEffect(() => {
    if (selectedSchool) {
      const schoolCourses = courses.filter(
        course => course.school_id === parseInt(selectedSchool)
      );
      setFilteredCourses(schoolCourses);
      // Clear selected course if school changes and the course isn't part of the school
      if (!schoolCourses.some(course => course.id === parseInt(selectedCourse))) {
        setSelectedCourse('');
      }
    } else {
      setFilteredCourses([]);
      setSelectedCourse('');
    }
  }, [selectedSchool, courses, selectedCourse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const alumniData = await getAllAlumni();
      const schoolsData = await getSchoolsAndCourses();
      
      // Filter out applied alumni
      const registeredAlumni = alumniData.alumni.filter(alum => alum.role === 'registered_alumni');
      
      setAlumni(registeredAlumni || []);
      setSchools(schoolsData.schools || []);
      setCourses(schoolsData.courses || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    setSelectedSchool(schoolId);
  };
  
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };
  
  const handleNameSearch = (e) => {
    setSearchName(e.target.value);
  };
  
  const resetFilters = () => {
    setSelectedSchool('');
    setSelectedCourse('');
    setSearchName('');
  };
  
  // Apply filters to alumni list
  const filteredAlumni = alumni.filter(alum => {
    // Filter by name
    const nameMatch = !searchName || 
      `${alum.first_name} ${alum.last_name}`.toLowerCase().includes(searchName.toLowerCase());
    
    // Filter by school
    let schoolMatch = true;
    if (selectedSchool) {
      const alumCourse = courses.find(c => c.id === alum.course_id);
      schoolMatch = alumCourse && alumCourse.school_id === parseInt(selectedSchool);
    }
    
    // Filter by course
    const courseMatch = !selectedCourse || alum.course_id === parseInt(selectedCourse);
    
    return nameMatch && schoolMatch && courseMatch;
  });
  
  // Get school color by school ID
  const getSchoolColor = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return '#9E0B0F'; // Default red
    
    const school = schools.find(s => s.id === course.school_id);
    return school?.school_color || '#9E0B0F';
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  return (
    <div className="alumni-directory-container">
      <h2 className="title-font">Alumni Directory</h2>
      
      <div className="filter-panel">
        <div className="filter-controls">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={handleNameSearch}
              className="name-search"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={selectedSchool}
              onChange={handleSchoolChange}
              className="school-filter"
            >
              <option value="">All Schools</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedSchool && (
            <div className="filter-group">
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="course-filter"
              >
                <option value="">All Courses</option>
                {filteredCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button className="secondary-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        
        <div className="results-info">
          Showing {filteredAlumni.length} of {alumni.length} alumni
        </div>
      </div>
      
      <div className="alumni-grid">
        {filteredAlumni.length > 0 ? (
          filteredAlumni.map((alum) => {
            const schoolColor = getSchoolColor(alum.course_id);
            return (
              <div 
                key={alum.id} 
                className="alumni-card"
                style={{ borderColor: schoolColor }}
              >
                <div 
                  className="profile-avatar"
                  style={{ backgroundColor: schoolColor }}
                >
                  <img 
                    src={`/images/${alum.gender || 'male'}.svg`} 
                    alt="Profile" 
                    className="avatar-image"
                  />
                </div>
                
                <h3 className="alumni-name">
                  {alum.first_name} {alum.last_name}
                </h3>
                
                <div className="alumni-info">
                  <p className="alumni-school">{alum.school_name}</p>
                  <p className="alumni-course">{alum.course_name}</p>
                  {alum.graduation_year && (
                    <p className="alumni-year">Class of {alum.graduation_year}</p>
                  )}
                </div>
                
                {alum.current_position && (
                  <p className="alumni-position">
                    {alum.current_position}
                    {alum.company && <span> at {alum.company}</span>}
                  </p>
                )}
                
                <div className="alumni-actions">
                  <Link 
                    to={`/profile/${alum.id}`} 
                    className="view-profile"
                    style={{ color: schoolColor }}
                  >
                    View Profile
                  </Link>
                  
                  <Link 
                    to={`/messages?recipient=${alum.user_id}&name=${alum.first_name}%20${alum.last_name}`} 
                    className="send-message"
                    style={{ backgroundColor: schoolColor }}
                  >
                    Send Message
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <p>No alumni found matching your criteria.</p>
            <button className="primary-button" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;