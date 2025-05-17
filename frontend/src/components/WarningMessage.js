import React from 'react';

const WarningMessage = ({ message }) => {
  return (
    <div style={{
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '15px',
      borderRadius: '4px',
      borderLeft: '5px solid #ffc107',
      marginBottom: '20px'
    }}>
      <p style={{ margin: 0, fontWeight: '500' }}>{message}</p>
    </div>
  );
};

export default WarningMessage;