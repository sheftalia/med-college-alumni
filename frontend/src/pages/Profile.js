import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProfile, updateProfile, getSchoolsAndCourses, createProfile } from '../services/api';
import Loader from '../components/Loader';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    graduation_year: '',
    course_id: '',
    bio: '',
    current_position: '',
    company: '',
    contact_email: '',
    phone: '',
    linkedin: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch schools and courses
        const schoolsData = await getSchoolsAndCourses();
        setSchools(schoolsData.schools || []);
        setCourses(schoolsData.courses || []);
        
        // Try to fetch profile if it exists
        try {
          const profileData = await getProfile();
          setProfile(profileData.profile);
          // Populate form with profile data
          setFormData({
            first_name: profileData.profile.first_name || '',
            last_name: profileData.profile.last_name || '',
            graduation_year: profileData.profile.graduation_year || '',
            course_id: profileData.profile.course_id || '',
            bio: profileData.profile.bio || '',
            current_position: profileData.profile.current_position || '',
            company: profileData.profile.company || '',
            contact_email: profileData.profile.contact_email || user?.email || '',
            phone: profileData.profile.phone || '',
            linkedin: profileData.profile.linkedin || ''
          });
        } catch (profileError) {
          // Profile doesn't exist yet - that's okay
          setProfile(null);
          setFormData({
            ...formData,
            contact_email: user?.email || ''
          });
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEdit = () => {
    setEditMode(!editMode);
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      
      if (profile) {
        // Update existing profile
        await updateProfile(profile.id, formData);
        const updatedProfile = await getProfile();
        setProfile(updatedProfile.profile);
      } else {
        // Create new profile
        const result = await createProfile(formData);
        if (result.profileId) {
          const newProfile = await getProfile();
          setProfile(newProfile.profile);
        }
      }
      
      setEditMode(false);
      alert('Profile saved successfully!');
    } catch (error) {
      alert('Failed to save profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  return (
    <div className="profile-container">
      <h2>{profile ? 'My Profile' : 'Create Your Profile'}</h2>
      
      <div className="profile-info">
        <label>First Name:</label>
        <input 
          type="text" 
          name="first_name" 
          value={formData.first_name} 
          onChange={handleChange} 
          disabled={!editMode} 
          required
        />
        
        <label>Last Name:</label>
        <input 
          type="text" 
          name="last_name" 
          value={formData.last_name} 
          onChange={handleChange} 
          disabled={!editMode} 
          required
        />
        
        <label>School & Course:</label>
        <select
          name="course_id"
          value={formData.course_id}
          onChange={handleChange}
          disabled={!editMode}
          required
        >
          <option value="">Select a course</option>
          {schools.map(school => (
            <optgroup key={school.id} label={school.name}>
              {courses
                .filter(course => course.school_id === school.id)
                .map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))
              }
            </optgroup>
          ))}
        </select>

        <label>Graduation Year:</label>
        <input 
          type="number" 
          name="graduation_year" 
          value={formData.graduation_year} 
          onChange={handleChange} 
          disabled={!editMode} 
          min="1977"
          max="2025"
        />
        
        <label>Bio:</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          disabled={!editMode}
          rows="4"
        ></textarea>

        <label>Current Position:</label>
        <input 
          type="text" 
          name="current_position" 
          value={formData.current_position} 
          onChange={handleChange} 
          disabled={!editMode} 
        />

        <label>Company:</label>
        <input 
          type="text" 
          name="company" 
          value={formData.company} 
          onChange={handleChange} 
          disabled={!editMode} 
        />

        <label>Contact Email:</label>
        <input 
          type="email" 
          name="contact_email" 
          value={formData.contact_email} 
          onChange={handleChange} 
          disabled={!editMode} 
        />

        <label>Phone Number:</label>
        <input 
          type="text" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          disabled={!editMode} 
        />

        <label>LinkedIn:</label>
        <input 
          type="text" 
          name="linkedin" 
          value={formData.linkedin} 
          onChange={handleChange} 
          disabled={!editMode} 
          placeholder="LinkedIn profile URL"
        />
      </div>

      <div className="profile-buttons">
        {editMode ? (
          <button onClick={saveChanges}>Save Changes</button>
        ) : (
          <button onClick={toggleEdit}>{profile ? 'Edit Profile' : 'Create Profile'}</button>
        )}
        {editMode && (
          <button className="cancel-button" onClick={toggleEdit}>Cancel</button>
        )}
      </div>
    </div>
  );
};

export default Profile;