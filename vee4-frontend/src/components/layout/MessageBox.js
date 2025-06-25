// src/components/layout/MessageBox.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const Message = ({ message }) => {
  const { sender, content, createdAt } = message;
  
  // Format date
  const formattedDate = new Date(createdAt).toLocaleString();
  
  return (
    <div className="message">
      <div className="message-header">
        <div className="message-sender">{sender.name}</div>
        <div className="message-time">{formattedDate}</div>
      </div>
      <div className="message-body">{content}</div>
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.shape({
    sender: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  }).isRequired
};

const MessageBox = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  return (
    <div>
      <h3 className="card-title" style={{ marginBottom: '1rem' }}>Messages</h3>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
      </div>
      
      <form className="input-group" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Type your message here..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="submit" variant="primary">Send</Button>
      </form>
    </div>
  );
};

MessageBox.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      sender: PropTypes.object.isRequired,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ).isRequired,
  onSendMessage: PropTypes.func.isRequired
};

export default MessageBox;