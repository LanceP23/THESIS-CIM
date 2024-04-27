import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import useConversation from '../zustand/useConversation';
import { extractTime } from '../utilities/extractTime';
import './ChatPage.css' 

const Message = ({message}) => {
    const { user } = useContext(UserContext);
    const{selectedConversation}=useConversation()
    const fromMe = message.senderId === user.id;
    const formattedTime = extractTime(message.createdAt);

    const chatClassName = fromMe?'chat-end':'chat-start';
    const bubbleBgColor = fromMe? 'bg-blue-500' : "";
  return (
    <div className={`chat ${chatClassName}`}>
      <div className={`chat-bubble text-white ${bubbleBgColor}`}>
        {message.message}
      </div>
      <div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>{formattedTime}</div>
    </div>
  )
}

export default Message
