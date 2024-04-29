import React from 'react'
import SearchUser from './SearchUser';
import MessageContainer from './MessageContainer';
import './ChatPage.css' 

const ChatPage = () => {
  
  return <div className="label_cont">
    <h2>Campus Comms.</h2>
    
  <div className='chat_container'>
   
    
    <div className="search_user_container">
      
    <SearchUser/>
    </div>
    <div className="messages_container">
    <MessageContainer/>
    </div>
    </div>
    </div>
  
};

export default ChatPage
