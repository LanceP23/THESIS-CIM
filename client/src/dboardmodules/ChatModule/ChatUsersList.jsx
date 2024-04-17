import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from './ChatWindow';
import './chatApp.css'; 

const ChatUserList = ({ onSelectUser, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users');
        const fetchedUsers = response.data.users;
  
        
        // Filter out the currently logged-in user if currentUser is not null
        const filteredUsers = currentUser 
          ? fetchedUsers.filter(user => user._id !== currentUser.id)
          : fetchedUsers;
        
        setUsers(filteredUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [currentUser]); 
  

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user) => {
    if(user!==selectedUser){
      setSelectedUser(user);
     onSelectUser(user); // Pass selected user to parent component
    }
    
  };

  return (
    <div className="chat-sidebar">
      <h2>Users</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <ul className="chat-list"> 
          {filteredUsers.map(user => (
            <li key={user._id} onClick={() => handleSelectUser(user)} className="chat-item">
              <div>{user.name}</div>
              <div>{user.adminType}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatUserList;
