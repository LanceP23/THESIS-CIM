import React, { useEffect, useContext } from 'react'
import Messages from './Messages'
import MessageInput from './MessageInput'
import useConversation from '../zustand/useConversation'
import { UserContext } from '../../context/userContext'
import './ChatPage.css' 

const MessageContainer = () => {
    const{selectedConversation,setSelectedConversation}  =useConversation();

    useEffect(()=>{

        return()=> setSelectedConversation(null)
    },[setSelectedConversation])
  return (
    <div className='flex flex-col '>
      {!selectedConversation?<NoChatSelected/>:(
        <>
        <div className=' bg-green-500 rounded-lg p-4 shadow-2xl'>
          <p className='text-xl'>To: <strong>{selectedConversation.name}</strong>{""}
        
          </p>
        </div>
        <div className="">
        <Messages/>
        </div>
        <div className="">
        <MessageInput/>
        </div>
        </>
      )}
    </div>
  )
}

export default MessageContainer;


const NoChatSelected=()=>{
    
    return(
        <div className='max-h-96'>
            <div className=' bg-slate-50 rounded-xl shadow-inner p-4 shadow-xl w-full mx-2'>
                <h1>Welcome</h1>
                <p>Select Users to start chatting!</p>

            </div>
        </div>
    )
}
