import React, { useState, useEffect, useContext } from 'react';
import ChatUserList from './ChatUsersList';
import ChatWindow from './ChatWindow';
import './chatApp.css';
import { UserContext } from '../../../context/userContext';

const ChatApp = () => {
  const { user } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="chat-app-container">
      <div className="chat-sidebar">
        <ChatUserList onSelectUser={handleSelectUser} currentUser={user} />
      </div>
      <div className="chat-window">
        {selectedUser && <ChatWindow selectedUser={selectedUser} currentUser={user} />}
      </div>
    </div>
  );
};

export default ChatApp;
