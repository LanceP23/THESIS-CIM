import React from 'react'
import SearchUser from './SearchUser';
import MessageContainer from './MessageContainer';
//import './ChatPage.css' Novs pag gusto mo makita design maayos yung chat enable mo to wala pang design yung chat pag wala to eh

const ChatPage = () => {
  return <div className='flex sm:h-[450px] md:h-[550px] rounded-lg overflow-hidden bg-green bg-clip-padding backdrop-filter backdrop-blur-lig bg-opacity-0'>
    <SearchUser/>
    <MessageContainer/>
    </div>
  
};

export default ChatPage
