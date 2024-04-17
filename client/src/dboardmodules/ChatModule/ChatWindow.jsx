import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './chatApp.css';
const ChatWindow = ({ selectedUser, currentUser, socket  }) => {
  console.log('Socket instance:', socket);
  console.log('ChatWindow component rendered');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null); 
  
  useEffect(() => {
    console.log("Messages state:", messages);
    console.log("Has chat history state:", hasChatHistory);
  }, [messages, hasChatHistory]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      console.log("New message received:", newMessage);
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const handleMessageSentConfirmation = (confirmation) => {
      console.log("Message sent confirmation:", confirmation);
  };
  
    socket.on('newMessage', handleNewMessage);
    socket.on('messageSentConfirmation', handleMessageSentConfirmation);
  
    return () => {
      console.log('Cleanup: Socket event listeners removed');
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSentConfirmation', handleMessageSentConfirmation);
    };
  }, [socket]);
  

  const fetchChatHistory = async (chatId) => {
    try {
      console.log('Fetching chat history for chat room:', chatId);
      const response = await axios.get(`/chat-history/${chatId}`);
      console.log('Response data:', response.data);
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
    if (selectedChatRoomId) {
      console.log('Fetching chat history for chat room:', selectedChatRoomId);
      fetchChatHistory(selectedChatRoomId);
    }
  }, [selectedChatRoomId]);

  useEffect(() => {
    // Update selectedChatRoomId when selectedUser changes
    if (selectedUser && selectedUser.chatId) {
      setSelectedChatRoomId(selectedUser.chatId);
    } else {
      setSelectedChatRoomId(null); // Reset selectedChatRoomId if no chatId is available
    }
  }, [selectedUser]);

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
      console.log('Request Headers:', config.headers);

      let chatId;

      // Check if a chat room exists between the current user and the selected recipient
      const existingChatRoomResponse = await axios.get(`/chat-room/${currentUser.id}/${selectedUser._id}`, config);


      if (existingChatRoomResponse.data.exists) {
        chatId = existingChatRoomResponse.data.chatId;
      } else {
        const createChatRoomResponse = await axios.post('/create-chat-room', {
          userId: currentUser.id,
          adminId: selectedUser._id,
        }, config);

        console.log('Create chat room response:', createChatRoomResponse.data);


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

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const handleSendMessage = debounce(sendMessage, 1000); 
  

  return (
    <div className="chat-window">
      {selectedUser ? (
        <>
          <h2>Chat with {selectedUser.name}</h2>
          {hasChatHistory ? (
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
              <button onClick={handleSendMessage}>Send</button>
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
