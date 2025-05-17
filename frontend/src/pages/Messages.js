import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserMessages, getSentMessages, sendMessage, markAsRead, getAllAlumni, getSchoolsAndCourses } from '../services/api';
import Loader from '../components/Loader';
import SuccessMessage from '../components/SuccessMessage';
import '../styles/Messages.css';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [alumni, setAlumni] = useState([]);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const location = useLocation();
  const composerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    recipient_id: '',
    school_id: '',
    course_id: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchMessages();
    fetchAlumniAndSchools();
  
    // Check URL for recipient parameters
    const queryParams = new URLSearchParams(location.search);
    const recipientId = queryParams.get('recipient');
    const recipientName = queryParams.get('name');
    
    if (recipientId) {
      setShowComposeForm(true);
      setFormData(prev => ({
        ...prev,
        recipient_id: recipientId
      }));
      
      // Scroll to composer form
      setTimeout(() => {
        if (composerRef.current) {
          composerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.search]);
  
  useEffect(() => {
    if (selectedSchoolId) {
      const schoolCourses = courses.filter(
        course => course.school_id === parseInt(selectedSchoolId)
      );
      setFilteredCourses(schoolCourses);
      // Clear selected course if school changes
      setFormData(prev => ({ ...prev, course_id: '' }));
    } else {
      setFilteredCourses([]);
    }
  }, [selectedSchoolId, courses]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const inboxResponse = await getUserMessages();
      const sentResponse = await getSentMessages();
      
      setMessages(inboxResponse.messages || []);
      setSentMessages(sentResponse.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAlumniAndSchools = async () => {
    try {
      const alumniResponse = await getAllAlumni();
      const schoolsResponse = await getSchoolsAndCourses();
      
      setAlumni(alumniResponse.alumni || []);
      setSchools(schoolsResponse.schools || []);
      setCourses(schoolsResponse.courses || []);
    } catch (error) {
      console.error('Failed to fetch alumni and schools:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    setSelectedSchoolId(schoolId);
    setFormData({ ...formData, school_id: schoolId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      alert('Subject and message are required');
      return;
    }
    
    if (!formData.recipient_id && !formData.school_id && !formData.course_id) {
      alert('Please select at least one recipient');
      return;
    }
    
    try {
      setLoading(true);
      await sendMessage(formData);
      setSuccessMessage('Message sent successfully!');
      
      // Reset form
      setFormData({
        recipient_id: '',
        school_id: '',
        course_id: '',
        subject: '',
        message: ''
      });
      
      // Refresh messages
      fetchMessages();
      
      // Close compose form
      setShowComposeForm(false);
    } catch (error) {
      alert('Failed to send message: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (messageId) => {
    try {
      await markAsRead(messageId);
      
      // Update messages state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };
  
  const getRecipientText = (message) => {
    if (message.recipient_first_name && message.recipient_last_name) {
      return `${message.recipient_first_name} ${message.recipient_last_name}`;
    } else if (message.school_name) {
      return `All Alumni from ${message.school_name}`;
    } else if (message.course_name) {
      return `All Alumni from ${message.course_name}`;
    } else {
      return 'Unknown recipient';
    }
  };

  if (loading && messages.length === 0 && sentMessages.length === 0) {
    return <Loader loading={true} />;
  }

  return (
    <div className="messages-container">
      <h2 className="title-font">Messages</h2>
      
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
      
      <div className="messages-actions">
        <button 
          className="primary-button compose-button" 
          onClick={() => setShowComposeForm(true)}
        >
          Compose Message
        </button>
        
        <div className="messages-tabs">
          <button 
            className={`tab-button ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            Inbox
          </button>
          <button 
            className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent
          </button>
        </div>
      </div>
      
      {showComposeForm && (
        <div className="compose-form" ref={composerRef}>
          <h3>Compose New Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Send to:</label>
              <select
                name="recipient_id"
                value={formData.recipient_id}
                onChange={handleChange}
              >
                <option value="">Select Individual Recipient</option>
                {alumni.map(alum => (
                  <option key={alum.user_id} value={alum.user_id}>
                    {alum.first_name} {alum.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Or send to all alumni in a school:</label>
              <select
                name="school_id"
                value={formData.school_id}
                onChange={handleSchoolChange}
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedSchoolId && (
              <div className="form-group">
                <label>Or send to all alumni in a course:</label>
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
              </div>
            )}
            
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Message:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                required
              ></textarea>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="primary-button">
                Send Message
              </button>
              <button 
                type="button" 
                className="secondary-button" 
                onClick={() => setShowComposeForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="messages-list">
        {activeTab === 'inbox' ? (
          messages.length > 0 ? (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-card ${!message.is_read ? 'unread' : ''}`}
                onClick={() => !message.is_read && handleMarkAsRead(message.id)}
              >
                <div className="message-header">
                  <div className="message-sender">
                    From: {message.sender_first_name} {message.sender_last_name}
                  </div>
                  <div className="message-date">{formatDate(message.created_at)}</div>
                </div>
                
                <div className="message-subject">{message.subject}</div>
                
                <div className="message-content">{message.message}</div>
                
                {!message.is_read && (
                  <div className="message-badge">New</div>
                )}
              </div>
            ))
          ) : (
            <p className="no-messages">Your inbox is empty.</p>
          )
        ) : (
          sentMessages.length > 0 ? (
            sentMessages.map((message) => (
              <div key={message.id} className="message-card sent">
                <div className="message-header">
                  <div className="message-recipient">
                    To: {getRecipientText(message)}
                  </div>
                  <div className="message-date">{formatDate(message.created_at)}</div>
                </div>
                
                <div className="message-subject">{message.subject}</div>
                
                <div className="message-content">{message.message}</div>
              </div>
            ))
          ) : (
            <p className="no-messages">You haven't sent any messages yet.</p>
          )
        )}
      </div>
    </div>
  );
};

export default Messages;