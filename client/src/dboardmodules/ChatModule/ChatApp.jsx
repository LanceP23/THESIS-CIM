import React, { useState, useEffect, useContext } from 'react';
import ChatUserList from './ChatUsersList';
import ChatWindow from './ChatWindow';
import './chatApp.css';
import { UserContext } from '../../../context/userContext';
import axios from 'axios';
import socket from '../../socket';

const ChatApp = () => {
  const { user } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.get(`/chat-room/${currentUser.id}/${user._id}`);
      if (response.data.exists) {
          setSelectedChatRoomId(response.data.chatId);
      } else {
          const createResponse = await axios.post('/create-chat-room', {
              userId: currentUser.id,
              adminId: user._id
          });
          setSelectedChatRoomId(createResponse.data.chatId);
      }
    } catch (error) {
      console.error('Error checking chat room existence:', error);
    }
  };

  return (
    <div className="chat-app-container">
      <div className="chat-sidebar">
        <ChatUserList onSelectUser={handleSelectUser} currentUser={currentUser} />
      </div>
      <div className="chat-window">
        {selectedUser && 
        <ChatWindow selectedUser={selectedUser} currentUser={currentUser} selectedChatRoomId={selectedChatRoomId} socket={socket} />}
      </div>
    </div>
  );
};

export default ChatApp;
