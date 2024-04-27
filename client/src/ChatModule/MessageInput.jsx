import React, { useEffect, useState } from 'react'
import useSendMessage from '../hooks/useSendMessage';
import './ChatPage.css' 
import {faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MessageInput = () => {
    const [message, setMessage] = useState("");
    const{loading, sendMessage} = useSendMessage();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if(!message) return;
        await sendMessage(message);
        setMessage("");
    }
    
  return (
    <form className='message_container' onSubmit={handleSubmit}>
        <div className='message_content'>
        <input 
        type = "text"
        className='input_message'
        placeholder='Send a message'
        value ={message}
        onChange = {(e)=> setMessage(e.target.value)}
        />
        <button type='submit' className='sent_button'>
        {loading? <div className=''></div>:<i> <FontAwesomeIcon icon={faPaperPlane} className='send_icon'/></i>}
        </button>
        </div>
    </form>
  )
}

export default MessageInput


