import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllAlumni, getSchoolsAndCourses } from '../services/api';
import '../styles/Home.css';

// Define school colours based on the images on Med College website
const schoolColors = {
  "School of Arts & Design": "#8d5b87", // Purple
  "Business School": "#2e4c9b", // Blue
  "School of Computing": "#0085BE", // Bright Blue
  "School of Education": "#e86c3a", // Orange
  "School of Engineering": "#4d4d4d", // Dark Gray
  "School of Health & Sport Sciences": "#0b6481", // Teal
  "School of Psychology": "#a9bd3a", // Lime Green
  "School of Shipping": "#bd9837", // Gold
  "School of Tourism & Hospitality": "#9E0B0F" // Red
};

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext); 
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const schoolsData = await getSchoolsAndCourses();
        setSchools(schoolsData.schools || []);
        setCourses(schoolsData.courses || []);
      
        // Only fetch alumni data if user is logged in
        if (isLoggedIn) {
          try {
           const alumniData = await getAllAlumni();
           setAlumni(alumniData.alumni || []);
         } catch (error) {
           console.error('Failed to fetch alumni data:', error);
           setAlumni([]);
          }
        } else {
          setAlumni([]); // Empty array for non-logged in users
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [isLoggedIn]);

  // Count courses by school and type
  const getSchoolStats = (schoolId) => {
    const schoolCourses = courses.filter(course => course.school_id === schoolId);
    const undergrad = schoolCourses.filter(course => course.degree_type === 'Undergraduate').length;
    const postgrad = schoolCourses.filter(course => course.degree_type === 'Postgraduate').length;
    
    // Count alumni from this school
    const schoolAlumni = alumni.filter(alum => {
      const alumCourse = courses.find(c => c.id === alum.course_id);
      return alumCourse && alumCourse.school_id === schoolId;
    }).length;
    
    return { undergrad, postgrad, alumniCount: schoolAlumni };
  };

  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="title-font">Mediterranean College Alumni Portal</h1>
        <p>Connecting graduates from Greece's premier higher education institution since 1977</p>
        <div className="hero-buttons">
          <Link to="/register" className="cta-button primary-button">Join the Network</Link>
          <Link to="/login" className="cta-button secondary-button">Alumni Login</Link>
        </div>
      </section>

      <section className="about-section">
        <h2 className="title-font section-title">About Mediterranean College</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              <strong>Mediterranean College</strong> was founded in 1977 and has established itself as a leading higher education institution in Greece. With our motto "Excellence in Education," we are committed to providing high-quality education and promoting academic excellence.
            </p>
            <p>
              Our alumni network connects graduates from all of our campuses in Athens, Thessaloniki, and Glyfada, creating opportunities for professional networking, continued learning, and community engagement.
            </p>
          </div>
          <div className="about-image">
            <img src="/images/future-is-yours.jpg" alt="The Future is Yours" className="future-image" />
          </div>
        </div>
      </section>

            <section className="schools-section">
        <h2 className="title-font section-title">Our Schools and Programmes</h2>
        <div className="schools-list">
          {schools.map(school => {
            const stats = getSchoolStats(school.id);
            const schoolColor = school.school_color || "#9E0B0F";
            
            return (
              <div className="school" key={school.id} style={{ borderTop: `3px solid ${schoolColor}` }}>
                <h3 style={{ color: schoolColor }}>{school.name}</h3>
                <p className="school-stats">
                  <span>{stats.undergrad} Undergraduate Courses</span>
                  <span>{stats.postgrad} Postgraduate Courses</span>
                  <span>{stats.alumniCount} Alumni Registered</span>
                </p>
                
                {isLoggedIn ? (
                  <Link to={`/alumni?school=${school.id}`} className="view-alumni" style={{ color: schoolColor }}>
                    View Alumni
                  </Link>
                ) : (
                  <Link to="/login" className="view-alumni" style={{ color: schoolColor }}>
                    Sign in to view alumni
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="campuses-section">
        <h2 className="title-font section-title">Our Campuses</h2>
        <div className="campuses">
          <div className="campus-card">
            <img src="/images/athens.jpg" alt="Athens Campus" className="campus-image" />
            <div className="campus-info">
              <h3>Athens</h3>
              <p>13 Kodrigktonos & 94 Patission Ave, 104 34</p>
              <p>Patission Ave & 8 Pellinis, 11251</p>
              <p>Tel: +30 210 8899600</p>
            </div>
          </div>
          
          <div className="campus-card">
            <img src="/images/glyfada.jpg" alt="Glyfada Campus" className="campus-image" />
            <div className="campus-info">
              <h3>Glyfada</h3>
              <p>33 Achilleos Street & 65 Vouliagmenis Avenue, 16675</p>
              <p>Tel: +30 210 8899600</p>
            </div>
          </div>
          
          <div className="campus-card">
            <img src="/images/thessaloniki.jpg" alt="Thessaloniki Campus" className="campus-image" />
            <div className="campus-info">
              <h3>Thessaloniki</h3>
              <p>21 Ionos Dragoumi, 54625</p>
              <p>Tel: +30 2310 287779 – +30 2314 440300</p>
            </div>
          </div>
        </div>
      </section>

      <section className="alumni-benefits">
        <h2 className="title-font section-title">Benefits of Joining Our Alumni Network</h2>
        <ul>
          <li>Connect with fellow graduates and build your professional network</li>
          <li>Access career opportunities and job listings</li>
          <li>Participate in exclusive events and continuing education</li>
          <li>Mentor current students or find mentors in your field</li>
          <li>Stay updated with college news and achievements</li>
        </ul>
        <Link to="/register" className="cta-button primary-button">Join Today</Link>
      </section>
    </div>
  );
};

export default Home;