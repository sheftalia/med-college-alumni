import React, { useState, useEffect } from 'react';
import { getAllAlumni, updateUserRole, deleteUser } from '../services/api';
import Loader from '../components/Loader';
import SuccessMessage from '../components/SuccessMessage';

const AdminPanel = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('applied_alumni');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await getAllAlumni();
      console.log('Fetched alumni:', response.alumni); // Add logging
      setAlumni(response.alumni || []);
    } catch (error) {
      console.error('Failed to fetch alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setLoading(true);
      await updateUserRole(userId, 'registered_alumni');
      setSuccessMessage('User approved successfully!');
      fetchAlumni();
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await deleteUser(userId);
        setSuccessMessage('User deleted successfully!');
        fetchAlumni();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredAlumni = alumni.filter(alum => {
    if (filter === 'all') return true;
    return alum.role === filter;
  });

  if (loading && alumni.length === 0) {
    return <Loader loading={true} />;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <h2 className="title-font" style={{ color: 'var(--primary-color)', marginBottom: '20px', textAlign: 'center' }}>Admin Panel</h2>
      
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontWeight: '500' }}>Filter by role:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ 
            padding: '12px', 
            borderRadius: '4px',
            border: '1px solid var(--medium-gray)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <option value="all">All Users</option>
          <option value="applied_alumni">Applied Alumni</option>
          <option value="registered_alumni">Registered Alumni</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredAlumni.length > 0 ? (
          filteredAlumni.map((alum) => (
            <div 
              key={alum.id || alum.user_id} 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '20px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>
                  {alum.first_name && alum.last_name ? 
                    `${alum.first_name} ${alum.last_name}` : 
                    'New User'}
                </h3>
                <p><strong>Email:</strong> {alum.email}</p>
                <p><strong>Role:</strong> {alum.role}</p>
                {alum.course_name && (
                  <p><strong>Course:</strong> {alum.course_name}</p>
                )}
              </div>
        
              <div style={{ display: 'flex', gap: '10px' }}>
                {alum.role === 'applied_alumni' && (
                  <button 
                    onClick={() => handleApprove(alum.user_id || alum.id)}
                    className="secondary-button"
                  >
                    Approve
                  </button>
                )}
          
                <button 
                  onClick={() => handleDelete(alum.user_id || alum.id)}
                  style={{ 
                    backgroundColor: '#d32f2f', 
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px'
          }}>
            No users found matching the filter.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;