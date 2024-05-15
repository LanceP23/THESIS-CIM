import React from 'react';
import useConversation from '../zustand/useConversation';
import { useSocketContext } from '../../context/socketContext';
import './ChatPage.css' 

const Conversation = ({ conversation, lastIdx }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    const isSelected = selectedConversation?.id === conversation._id;

    return (
        <>
            <div
                className={`custom-container ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
            >
                <div className={`container_1${isOnline ? 'online' : ''}`}>
                    <div className='flex_container'>
                  
                   
                        <p className='flex flex-row justify-normal text-md font-semibold'>  {isOnline ? <div className='online-dot'></div> : <div className='offline-dot'></div>}{conversation.name}</p>
                        
                    </div>
                </div>
            </div>
            <div className='divider divider-success'></div>
        </>
    );
};

export default Conversation;
