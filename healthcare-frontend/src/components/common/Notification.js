import React from 'react';
import './Notification.css';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="notification-close">×</button>
    </div>
  );
};

export default Notification;
