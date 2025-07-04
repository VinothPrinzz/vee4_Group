import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const Message = ({ message, currentUserRole }) => {
  const { sender, content, createdAt, isSystemMessage } = message;
  
  // Format date
  const formattedDate = new Date(createdAt).toLocaleString();
  
  // Determine message type for styling
  const isAdminMessage = sender.name === 'Vee4 Admin' || isSystemMessage;
  
  // Get appropriate sender name
  const getSenderName = () => {
    if (isSystemMessage) {
      return 'Vee4 Team';
    }
    return sender.name === 'Vee4 Admin' ? 'Vee4 Admin' : sender.name;
  };
  
  return (
    <div className={`message ${isAdminMessage ? 'message-admin' : 'message-customer'}`}>
      <div className="message-header">
        <div className={`message-sender ${isAdminMessage ? 'sender-admin' : 'sender-customer'}`}>
          {getSenderName()}
        </div>
        <div className="message-time">{formattedDate}</div>
      </div>
      <div className="message-body">{content}</div>
    </div>
  );
};

const MessageBox = ({ messages, onSendMessage, currentUserRole }) => {
  const [newMessage, setNewMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  return (
    <div className="message-box">
      <h3 className="card-title" style={{ marginBottom: '1rem' }}>Messages</h3>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message 
              key={message.id} 
              message={message} 
              currentUserRole={currentUserRole}
            />
          ))
        )}
      </div>
      
      <form className="message-input-group" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="form-control message-input" 
          placeholder="Type your message here..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={!newMessage.trim()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send
        </Button>
      </form>
    </div>
  );
};

export default MessageBox;