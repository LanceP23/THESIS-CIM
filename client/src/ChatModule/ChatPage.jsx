import React from 'react'
import SearchUser from './SearchUser';
import MessageContainer from './MessageContainer';
import './ChatPage.css' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faMessage } from '@fortawesome/free-solid-svg-icons';

const ChatPage = () => {
  
  return <div className="label_cont">
    <h2>Campus Comms. <FontAwesomeIcon icon={faComment}/></h2>
    
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
