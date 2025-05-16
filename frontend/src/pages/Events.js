import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import Loader from '../components/Loader';
import '../styles/Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events");
      } finally {
        setLoading(false); // Hide loader
      }
    };
    loadEvents();
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <div className="events-container">
        <h2>Upcoming Alumni Events</h2>
        <p>Discover upcoming events and networking opportunities with fellow alumni.</p>

        <div className="events-list">
          {events.map((event, index) => (
            <div className="event-item" key={index}>
              <h3>{event.title}</h3>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Events;