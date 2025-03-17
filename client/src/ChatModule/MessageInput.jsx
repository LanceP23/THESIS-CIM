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
    <form className='m-3 ' onSubmit={handleSubmit}>
      <div className="flex flex-row w-full justify-between items-center ">
        <div className='w-full'>
        <input 
        type = "text"
        className='input input-bordered input-success w-full rounded-full p-3 shadow-lg shadow-black bg-base-100 text-white'
        placeholder='Send a message'
        value ={message}
        onChange = {(e)=> setMessage(e.target.value)}
        />
        </div>
       
       <div className="">
        <button type='submit' className='sent_button'>
        {loading? <div className=''></div>:<i> <FontAwesomeIcon icon={faPaperPlane} className=' mx-2 text-xl text-slate-50 transition-transform duration-300 ease-in-out transform hover:scale-125 hover:text-green-500 shadow-lg shadow-black'/></i>}
        </button>
        </div>
      </div>
        
    </form>
  )
}
export default MessageInput