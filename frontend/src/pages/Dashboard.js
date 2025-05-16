import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllAlumni } from '../services/api';
import Loader from '../components/Loader';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    school: '',
    name: ''
  });

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const response = await getAllAlumni();
        setAlumni(response.alumni || []);
      } catch (error) {
        console.error('Failed to fetch alumni:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const applyFilter = async () => {
    try {
      setLoading(true);
      const response = await getAllAlumni(filter);
      setAlumni(response.alumni || []);
    } catch (error) {
      console.error('Failed to fetch filtered alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = async () => {
    setFilter({ school: '', name: '' });
    try {
      setLoading(true);
      const response = await getAllAlumni();
      setAlumni(response.alumni || []);
    } catch (error) {
      console.error('Failed to reset alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user?.first_name || 'Alumni'}</h2>
      <p>This is your dashboard where you can connect with fellow graduates and see what's happening in our community.</p>

      <div className="dashboard-actions">
        <Link to="/profile" className="action-button">
          Update My Profile
        </Link>
      </div>

      <div className="alumni-directory">
        <h3>Alumni Directory</h3>
        
        <div className="filter-controls">
          <input 
            type="text" 
            name="name" 
            placeholder="Search by name..." 
            value={filter.name} 
            onChange={handleFilterChange} 
          />
          <input 
            type="text" 
            name="school" 
            placeholder="Filter by school..." 
            value={filter.school} 
            onChange={handleFilterChange} 
          />
          <button onClick={applyFilter}>Apply Filter</button>
          <button onClick={resetFilter}>Reset</button>
        </div>

        <div className="alumni-list">
          {alumni.length > 0 ? (
            alumni.map((person) => (
              <div key={person.id} className="alumni-card">
                <div className="alumni-info">
                  <h4>{person.first_name} {person.last_name}</h4>
                  <p><strong>School:</strong> {person.school_name}</p>
                  <p><strong>Course:</strong> {person.course_name}</p>
                  <p><strong>Graduated:</strong> {person.graduation_year}</p>
                  {person.current_position && (
                    <p><strong>Current Position:</strong> {person.current_position} {person.company && `at ${person.company}`}</p>
                  )}
                </div>
                {person.linkedin && (
                  <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                    Connect on LinkedIn
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="no-results">No alumni found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;