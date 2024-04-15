import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './chatApp.css';

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null); 

  const fetchChatHistory = async (selectedChatRoomId) => { 
    try {
      const response = await axios.get(`/chat-history/${selectedChatRoomId}`);
      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(response.data.messages);
        setHasChatHistory(true);
      } else {
        setMessages([]);
        setHasChatHistory(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser && selectedUser._id && selectedChatRoomId) { // Check if selectedChatRoomId is defined
      fetchChatHistory(selectedChatRoomId);
    }
  }, [selectedUser, selectedChatRoomId]); // Update the effect when selectedChatRoomId changes

  const sendMessage = async () => {
    try {
      if (!selectedUser || !currentUser) {
        console.error('No selected recipient or current user');
        return;
      }

      // Get the authorization token
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      if (!token) {
        throw new Error('Token not found');
      }

      // Prepare the request headers with the authorization token
      const config = {
        headers: {
          'Authorization': `Bearer ${token.split('=')[1]}`,
        }
      };

      let chatId;

      // Check if a chat room exists between the current user and the selected recipient
      const existingChatRoomResponse = await axios.get(`/chat-room/${currentUser.id}/${selectedUser._id}`, config);


      if (existingChatRoomResponse.data.exists) {
        chatId = existingChatRoomResponse.data.chatId;
      } else {
        const createChatRoomResponse = await axios.post('/create-chat-room', {
          senderId: currentUser.id,
          recipientId: selectedUser._id,
        }, config);

        if (createChatRoomResponse.data.error) {
          throw new Error(createChatRoomResponse.data.error);
        }

        chatId = createChatRoomResponse.data._id;
      }

      // Send the message to the chat room
      await axios.post('/send-message', {
        chatId,
        content: newMessage,
        recipientId: selectedUser._id,
      }, config);

      // Update the messages state using the functional form of setMessages
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: currentUser._id, content: newMessage }
      ]);

      // Clear the input field after sending the message
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-window">
      {selectedUser ? (
        <>
          <h2>Chat with {selectedUser.name}</h2>
          {loading ? (
            <p>Loading chat history...</p>
          ) : hasChatHistory ? (
            <div className="message-container">
              {messages.map((message, index) => (
                <div key={index} className={message.sender === selectedUser._id ? 'sent' : 'received'}>
                  {message.content}
                </div>
              ))}
            </div>
          ) : (
            <p>No chat history. Start a conversation!</p>
          )}
          <div className="chat-input-container">
            <div className="message-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </>
      ) : (
        <p>No user selected</p>
      )}
    </div>
  );
};

export default ChatWindow;
