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
    <div className='selected_container flexcontainer'>
      {!selectedConversation?<NoChatSelected/>:(
        <>
        <div className='name_cont'>
          <p><strong>To: {selectedConversation.name}</strong>{""}
        
          </p>
        </div>
        <Messages/>
        <MessageInput/>
        </>
      )}
    </div>
  )
}

export default MessageContainer;


const NoChatSelected=()=>{
    
    return(
        <div className='container'>
            <div className='content'>
                <h1>Welcome</h1>
                <p>Select Users to start chatting!</p>

            </div>
        </div>
    )
}
