import React, { useEffect, useState } from 'react';
import { fetchMessages } from '../services/api';
import Loader from '../components/Loader';
import '../styles/Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchMessages();
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages");
      } finally {
        setLoading(false); // Hide loader
      }
    };
    loadMessages();
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <div className="messages-container">
        <h2>Your Messages</h2>
        <p>Communicate with other alumni and build your network.</p>

        <div className="messages-list">
          {messages.map((message, index) => (
            <div className="message-item" key={index}>
              <h4>{message.sender}</h4>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Messages;