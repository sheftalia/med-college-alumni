import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../services/api';
import Loader from '../components/Loader';
import SuccessMessage from '../components/SuccessMessage';
import '../styles/Events.css';

const Events = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    event_date: '',
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleForm = (event = null) => {
    if (event) {
      // Format date for the datetime-local input
      const dateObj = new Date(event.event_date);
      const formattedDate = dateObj.toISOString().slice(0, 16);
      
      setFormData({
        id: event.id,
        title: event.title,
        description: event.description || '',
        event_date: formattedDate,
        location: event.location
      });
    } else {
      setFormData({
        id: null,
        title: '',
        description: '',
        event_date: '',
        location: ''
      });
    }
    
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (formData.id) {
        // Update existing event
        await updateEvent(formData.id, formData);
        setSuccessMessage('Event updated successfully!');
      } else {
        // Create new event
        await createEvent(formData);
        setSuccessMessage('Event created successfully!');
      }
      
      // Refresh the events list
      fetchEvents();
      setShowForm(false);
    } catch (error) {
      alert('Failed to save event: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setLoading(true);
        await deleteEvent(eventId);
        setSuccessMessage('Event deleted successfully!');
        // Refresh the events list
        fetchEvents();
      } catch (error) {
        alert('Failed to delete event: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  if (loading && events.length === 0) {
    return <Loader loading={true} />;
  }

  return (
    <div className="events-container">
      <h2 className="title-font">Alumni Events</h2>
      
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
      
      {isAdmin() && !showForm && (
        <button className="primary-button" onClick={() => toggleForm()}>
          Create New Event
        </button>
      )}
      
      {showForm && (
        <div className="event-form">
          <h3>{formData.id ? 'Edit Event' : 'Create New Event'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date and Time:</label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="primary-button">
                {formData.id ? 'Update Event' : 'Create Event'}
              </button>
              <button 
                type="button" 
                className="secondary-button" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="events-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <div className="event-date">{formatDate(event.event_date)}</div>
              </div>
              
              <div className="event-location">
                <strong>Location:</strong> {event.location}
              </div>
              
              {event.description && (
                <div className="event-description">{event.description}</div>
              )}
              
              {isAdmin() && (
                <div className="event-actions">
                  <button 
                    className="edit-button" 
                    onClick={() => toggleForm(event)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-events">No upcoming events at this time.</p>
        )}
      </div>
    </div>
  );
};

export default Events;