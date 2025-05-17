import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProfile } from '../services/api';
import Loader from '../components/Loader';
import '../styles/Profile.css';

const ApplicationStatus = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setProfile(response.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  return (
    <div className="profile-container">
      <h2>Application Status</h2>
      
      <div className="application-status">
        <div className="status-banner pending">
          <h3>Your application is pending approval</h3>
          <p>Thank you for registering with Mediterranean College Alumni Portal. Your account is currently awaiting administrator approval. Thank you for your patience.</p>
        </div>
        
        {profile && (
          <div className="profile-details">
            <h3>Your Profile Information</h3>
            
            <div className="details-section">
              <h4>Personal Information</h4>
              <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
              <p><strong>Email:</strong> {profile.contact_email}</p>
              {profile.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
              {profile.gender && <p><strong>Gender:</strong> {profile.gender === 'male' ? 'Male' : 'Female'}</p>}
            </div>
            
            <div className="details-section">
              <h4>Academic Information</h4>
              <p><strong>School:</strong> {profile.school_name}</p>
              <p><strong>Course:</strong> {profile.course_name}</p>
              {profile.graduation_year && <p><strong>Graduation Year:</strong> {profile.graduation_year}</p>}
            </div>
            
            {(profile.current_position || profile.company) && (
              <div className="details-section">
                <h4>Professional Information</h4>
                {profile.current_position && <p><strong>Current Position:</strong> {profile.current_position}</p>}
                {profile.company && <p><strong>Company:</strong> {profile.company}</p>}
                {profile.linkedin && <p><strong>LinkedIn:</strong> {profile.linkedin}</p>}
              </div>
            )}
            
            {profile.bio && (
              <div className="details-section">
                <h4>About</h4>
                <p>{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatus;