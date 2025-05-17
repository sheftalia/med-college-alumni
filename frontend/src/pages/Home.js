import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllAlumni, getSchoolsAndCourses } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const { isLoggedIn, isAdmin, isAppliedAlumni, logout } = useContext(AuthContext);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const schoolsData = await getSchoolsAndCourses();
      setSchools(schoolsData.schools || []);
      setCourses(schoolsData.courses || []);
      
      // Always try to fetch alumni data for counts
      try {
        const alumniData = await getAllAlumni();
        // Only count registered alumni
        const registeredAlumni = alumniData.alumni.filter(a => a.role === 'registered_alumni');
        setAlumni(registeredAlumni || []);
      } catch (error) {
        console.error('Failed to fetch alumni data:', error);
        setAlumni([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count courses by school and type
  const getSchoolStats = (schoolId) => {
    const schoolCourses = courses.filter(course => course.school_id === schoolId);
    const undergrad = schoolCourses.filter(course => course.degree_type === 'Undergraduate').length;
    const postgrad = schoolCourses.filter(course => course.degree_type === 'Postgraduate').length;
    
    // Count alumni from this school (only registered alumni)
    const schoolAlumni = alumni.filter(alum => {
      const alumCourse = courses.find(c => c.id === alum.course_id);
      return alumCourse && alumCourse.school_id === schoolId && alum.role === 'registered_alumni';
    }).length;
    
    return { undergrad, postgrad, alumniCount: schoolAlumni };
  };

  // Helper function to get school image filename
  const getSchoolImageFilename = (schoolName) => {
    return schoolName.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-') + '.jpg';
  };

  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="title-font">Mediterranean College Alumni Portal</h1>
        <p>Connecting Graduates from the #1 Private College in Greece</p>
        <div className="hero-buttons">
          {!isLoggedIn ? (
            <>
              <Link to="/register" className="cta-button primary-button">Register</Link>
              <Link to="/login" className="cta-button secondary-button">Login</Link>
            </>
          ) : isAppliedAlumni() ? (
            <>
              <Link to="/application-status" className="cta-button primary-button">Application Status</Link>
              <button onClick={handleLogout} className="cta-button secondary-button">Logout</button>
            </>
          ) : isAdmin() ? (
            <>
              <Link to="/admin" className="cta-button primary-button">Admin Panel</Link>
              <button onClick={handleLogout} className="cta-button secondary-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="cta-button primary-button">Dashboard</Link>
              <button onClick={handleLogout} className="cta-button secondary-button">Logout</button>
            </>
          )}
        </div>
      </section>

      <section className="about-section">
        <h2 className="title-font section-title">About Mediterranean College</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              Mediterranean College is the first independent Anglophone College to be founded in Greece, in 1977. Since then, it has been continuously operating according to standards of countries with a long tradition in higher education, such as the United States and the United Kingdom.
            </p>
            <p>
              Mediterranean was the first college in Greece (in 1992) to "franchise" a degree programme from a British State University. Today, in partnership with reputable UK universities and awarding bodies, Mediterranean College offers a broad portfolio of franchised undergraduate, postgraduate and Continuing Professional Development (CPD) courses. Students have the option of registering to programmes that are delivered on a full-time or part time/ flexible mode and are taught in either English or Greek. Upon successful completion of the courses, students are awarded degrees and qualifications that are issued by the collaborating Universities awarding bodies.
            </p>
          </div>
          <div className="about-image">
            <img src="/images/future-is-yours.jpg" alt="The Future is Yours" className="future-image" />
          </div>
        </div>
      </section>

      <section className="schools-section">
        <h2 className="title-font section-title">Our Schools and Courses</h2>
        <div className="schools-list">
          {schools.map(school => {
            const stats = getSchoolStats(school.id);
            const schoolColor = school.school_color || "#9E0B0F";
            const schoolImage = getSchoolImageFilename(school.name);
            
            return (
              <div className="school" key={school.id} style={{ borderTop: `3px solid ${schoolColor}` }}>
                <img 
                  src={`/images/${schoolImage}`} 
                  alt={school.name} 
                  className="school-image" 
                />
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
              <p>94 Patission Ave & 13 Kodrigktonos, 10434</p>
              <p>8 Pellinis & 107 Patission Ave, 11251</p>
              <p>Tel: +30 210 8899600</p>
            </div>
          </div>
          
          <div className="campus-card">
            <img src="/images/glyfada.jpg" alt="Glyfada Campus" className="campus-image" />
            <div className="campus-info">
              <h3>Glyfada</h3>
              <p>33 Achilleos & 65 Vouliagmenis Ave, 16675</p>
              <p>Tel: +30 210 8899600</p>
            </div>
          </div>
          
          <div className="campus-card">
            <img src="/images/thessaloniki.jpg" alt="Thessaloniki Campus" className="campus-image" />
            <div className="campus-info">
              <h3>Thessaloniki</h3>
              <p>21 Ionos Dragoumi, 54625</p>
              <p>15 Ionos Dragoumi, 54625</p>
              <p>Tel: +30 2310 287779</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;