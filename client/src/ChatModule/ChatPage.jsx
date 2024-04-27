import React from 'react'
import SearchUser from './SearchUser';
import MessageContainer from './MessageContainer';
import './ChatPage.css' 

const ChatPage = () => {
  
  return <div className='chat_container'>
    <div className="search_user_container">
    <SearchUser/>
    </div>
    <div className="messages_container">
    <MessageContainer/>
    </div>
    </div>
    
  
};

export default ChatPage
