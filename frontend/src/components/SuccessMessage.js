import React from 'react';
import '../styles/SuccessMessage.css';

const SuccessMessage = ({ message, onClose }) => {
  return (
    <div className="success-message">
      <p>{message}</p>
      <button onClick={onClose} className="success-button">OK</button>
    </div>
  );
};

export default SuccessMessage;