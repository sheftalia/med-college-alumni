import React, { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '../services/api';
import Loader from '../components/Loader';
import '../styles/Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    school: '',
    graduationYear: ''
  });

  const [loading, setLoading] = useState(true); // For loading spinner
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false); // Hide loader when done
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const toggleEdit = () => {
    setEditMode(!editMode);
  };

  const saveChanges = async () => {
    try {
      await updateProfile(profileData);
      alert('Profile Updated!');
      setEditMode(false);
    } catch (error) {
      alert("Failed to update profile. Try again.");
    }
  };

  return (
    <>
      <Loader loading={loading} />
      <div className="profile-container">
        <h2>My Profile</h2>
        <div className="profile-info">
          <label>Full Name:</label>
          <input 
            type="text" 
            name="fullName" 
            value={profileData.fullName} 
            onChange={handleChange} 
            disabled={!editMode} 
          />
          
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={profileData.email} 
            onChange={handleChange} 
            disabled={!editMode} 
          />
          
          <label>School:</label>
          <input 
            type="text" 
            name="school" 
            value={profileData.school} 
            onChange={handleChange} 
            disabled={!editMode} 
          />

          <label>Graduation Year:</label>
          <input 
            type="text" 
            name="graduationYear" 
            value={profileData.graduationYear} 
            onChange={handleChange} 
            disabled={!editMode} 
          />
        </div>

        <div className="profile-buttons">
          {editMode ? (
            <button onClick={saveChanges}>Save Changes</button>
          ) : (
            <button onClick={toggleEdit}>Edit Profile</button>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;