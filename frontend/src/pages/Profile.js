import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProfile, updateProfile, getSchoolsAndCourses, createProfile, getAlumniById } from '../services/api';
import Loader from '../components/Loader';
import SuccessMessage from '../components/SuccessMessage';
import '../styles/Profile.css';

const Profile = ({ viewMode = false }) => {
  const { user } = useContext(AuthContext);
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(null);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    graduation_year: '',
    course_id: '',
    gender: '',
    bio: '',
    current_position: '',
    company: '',
    contact_email: '',
    phone: '',
    linkedin: ''
  });

  useEffect(() => {
    if ((user && !viewMode) || (viewMode && profileId)) {
      loadData();
    }
  }, [user, viewMode, profileId]);
  
  useEffect(() => {
    if (selectedSchoolId) {
      const schoolCourses = courses.filter(
        course => course.school_id === parseInt(selectedSchoolId)
      );
      setFilteredCourses(schoolCourses);
      // Clear selected course if school changes
      setFormData(prevData => ({ ...prevData, course_id: '' }));
    } else {
      setFilteredCourses([]);
    }
  }, [selectedSchoolId, courses]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch schools and courses
      const schoolsData = await getSchoolsAndCourses();
      setSchools(schoolsData.schools || []);
      setCourses(schoolsData.courses || []);
      
      // If in view mode, load the specific profile
      if (viewMode && profileId) {
        try {
          const profileData = await getAlumniById(profileId);
          setProfile(profileData.profile);
          
          // Set selected school ID for filtering courses
          const courseObj = schoolsData.courses.find(c => c.id === profileData.profile.course_id);
          if (courseObj) {
            setSelectedSchoolId(courseObj.school_id.toString());
            setFilteredCourses(
              schoolsData.courses.filter(c => c.school_id === courseObj.school_id)
            );
          }
          
          // Populate form with profile data
          setFormData({
            first_name: profileData.profile.first_name || '',
            last_name: profileData.profile.last_name || '',
            graduation_year: profileData.profile.graduation_year || '',
            course_id: profileData.profile.course_id || '',
            gender: profileData.profile.gender || '',
            bio: profileData.profile.bio || '',
            current_position: profileData.profile.current_position || '',
            company: profileData.profile.company || '',
            contact_email: profileData.profile.contact_email || '',
            phone: profileData.profile.phone || '',
            linkedin: profileData.profile.linkedin || ''
          });
          
          setShowForm(true); // Show form in view mode
        } catch (error) {
          console.error("Failed to load alumni profile:", error);
        }
      } else {
        // Try to fetch own profile if it exists
        try {
          const profileData = await getProfile();
          setProfile(profileData.profile);
          
          // Set selected school ID for filtering courses
          const courseObj = schoolsData.courses.find(c => c.id === profileData.profile.course_id);
          if (courseObj) {
            setSelectedSchoolId(courseObj.school_id.toString());
            setFilteredCourses(
              schoolsData.courses.filter(c => c.school_id === courseObj.school_id)
            );
          }
          
          // Populate form with profile data - using functional update
          setFormData({
            first_name: profileData.profile.first_name || '',
            last_name: profileData.profile.last_name || '',
            graduation_year: profileData.profile.graduation_year || '',
            course_id: profileData.profile.course_id || '',
            gender: profileData.profile.gender || '',
            bio: profileData.profile.bio || '',
            current_position: profileData.profile.current_position || '',
            company: profileData.profile.company || '',
            contact_email: profileData.profile.contact_email || user?.email || '',
            phone: profileData.profile.phone || '',
            linkedin: profileData.profile.linkedin || ''
          });
          
          setShowForm(true); // Show form for editing
        } catch (profileError) {
          // Profile doesn't exist yet
          setProfile(null);
          setFormData(prevData => ({
            ...prevData,
            contact_email: user?.email || ''
          }));
          setShowForm(false); // Hide form for initial creation
        }
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    setSelectedSchoolId(schoolId);
    // Clear any previously selected course
    setFormData(prevData => ({ ...prevData, course_id: '' }));
  };

  const toggleEdit = () => {
    if (!profile) {
      // For initial creation, toggle showing the form
      setShowForm(!showForm);
    } else {
      // For existing profile, toggle edit mode
      setEditMode(!editMode);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      
      if (profile) {
        // Update existing profile
        await updateProfile(profile.id, formData);
        const updatedProfile = await getProfile();
        setProfile(updatedProfile.profile);
        setSuccessMessage('Profile updated successfully!');
      } else {
        // Create new profile
        const result = await createProfile(formData);
        if (result.profileId) {
          const newProfile = await getProfile();
          setProfile(newProfile.profile);
          setSuccessMessage('Profile created successfully!');
        }
      }
      
      setEditMode(false);
    } catch (error) {
      alert('Failed to save profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getSchoolColor = (courseId) => {
    if (!courseId || !courses.length) return '#9E0B0F'; // Default red
  
    const course = courses.find(c => c.id === courseId);
    if (!course) return '#9E0B0F';
  
    const school = schools.find(s => s.id === course.school_id);
    return school?.school_color || '#9E0B0F';
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  // If in view mode and viewing someone else's profile
  if (viewMode) {
  return (
    <div className="profile-container">
      <h2 className="alumni-profile-title">Alumni Profile</h2>
      
      {profile ? (
        <div className="profile-view">
          <div className="profile-header">
            <div 
              className="profile-avatar"
              style={{ backgroundColor: getSchoolColor(profile.course_id) }}
            >
              <img 
                src={`/images/${profile.gender || 'male'}.svg`} 
                alt="Profile" 
                className="avatar-image"
              />
            </div>
            <div className="profile-name-info">
              <h3>{profile.first_name} {profile.last_name}</h3>
              <p className="school-info">{profile.school_name}</p>
              <p className="course-info">{profile.course_name}</p>
              {profile.graduation_year && (
                <p className="year-info">Class of {profile.graduation_year}</p>
              )}
            </div>
          </div>
          
          {profile.bio && (
            <div className="profile-section">
              <h4 className="section-heading">About</h4>
              <p>{profile.bio}</p>
            </div>
          )}
          
          {(profile.current_position || profile.company) && (
            <div className="profile-section">
              <h4 className="section-heading">Professional Information</h4>
               {profile.current_position && (
                 <p><strong>Current Position:</strong> {profile.current_position}</p>
                )}
               {profile.company && (
                  <p><strong>Company:</strong> {profile.company}</p>
                )}
             </div>
           )}
          
           <div className="profile-section">
             <h4 className="section-heading">Contact Information</h4>
             {profile.contact_email && (
                <p><strong>Email:</strong> {profile.contact_email}</p>
              )}
              {profile.phone && (
                <p><strong>Phone:</strong> {profile.phone}</p>
             )}
             {profile.linkedin && (
               <p>
                  <strong>LinkedIn:</strong> {' '}
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-text-link">
                    {profile.linkedin}
                  </a>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="not-found">Alumni profile not found.</p>
        )}
      </div>
    );
  }

  // Normal edit mode for own profile
  return (
    <div className="profile-container">
      <h2>{profile ? 'My Profile' : 'Create Your Profile'}</h2>
      
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
      
      {!profile && !showForm ? (
        <div className="profile-create-prompt">
          <p>Welcome to the Mediterranean College Alumni Portal! Please create your profile to connect with fellow alumni.</p>
          <button onClick={toggleEdit} className="primary-button">Create Profile</button>
        </div>
      ) : (
        <>
          <div className="profile-info">
            {(showForm || profile) && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name:</label>
                    <input 
                      type="text" 
                      name="first_name" 
                      value={formData.first_name} 
                      onChange={handleChange} 
                      disabled={!editMode && profile} 
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Last Name:</label>
                    <input 
                      type="text" 
                      name="last_name" 
                      value={formData.last_name} 
                      onChange={handleChange} 
                      disabled={!editMode && profile} 
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Gender:</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={!editMode && profile}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Graduation Year:</label>
                    <input 
                      type="number" 
                      name="graduation_year" 
                      value={formData.graduation_year} 
                      onChange={handleChange} 
                      disabled={!editMode && profile} 
                      min="1977"
                      max="2025"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>School:</label>
                    <select
                      name="school_id"
                      value={selectedSchoolId}
                      onChange={handleSchoolChange}
                      disabled={!editMode && profile}
                      required
                    >
                      <option value="">Select School</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Course:</label>
                    <select
                      name="course_id"
                      value={formData.course_id}
                      onChange={handleChange}
                      disabled={(!editMode && profile) || !selectedSchoolId}
                      required
                    >
                      <option value="">Select Course</option>
                      {filteredCourses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Bio:</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!editMode && profile}
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Current Position:</label>
                    <input 
                      type="text" 
                      name="current_position" 
                      value={formData.current_position} 
                      onChange={handleChange} 
                      disabled={!editMode && profile} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Company:</label>
                    <input 
                      type="text" 
                      name="company" 
                      value={formData.company} 
                      onChange={handleChange} 
                      disabled={!editMode && profile} 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Email:</label>
                    <input 
                      type="email" 
                      name="contact_email" 
                      value={formData.contact_email} 
                      onChange={handleChange} 
                      disabled={!editMode && profile} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number:</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      disabled={!editMode && profile} 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>LinkedIn:</label>
                  <input 
                    type="text" 
                    name="linkedin" 
                    value={formData.linkedin} 
                    onChange={handleChange} 
                    disabled={!editMode && profile} 
                    placeholder="LinkedIn profile URL"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="profile-buttons">
            {profile ? (
              editMode ? (
                <>
                  <button onClick={saveChanges} className="primary-button">Save Changes</button>
                  <button onClick={toggleEdit} className="secondary-button">Cancel</button>
                </>
              ) : (
                <button onClick={toggleEdit} className="primary-button">Edit Profile</button>
              )
            ) : (
              showForm && (
                <>
                  <button onClick={saveChanges} className="primary-button">Create Profile</button>
                  <button onClick={toggleEdit} className="secondary-button">Cancel</button>
                </>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;