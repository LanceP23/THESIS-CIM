import React from 'react';
import useConversation from '../zustand/useConversation';
import { useSocketContext } from '../../context/socketContext';
import './ChatPage.css' 

const Conversation = ({ conversation, lastIdx }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    const isSelected = selectedConversation?.id === conversation._id;

    const handleClick = () => {
        // Preserve the existing setSelectedConversation logic
        setSelectedConversation(conversation);
    };

    return (
        <>
            <div
                className={`custom-container ${isSelected ? 'selected' : ''} `}
                onClick={handleClick}
            >
                <div className={`container_1${isOnline ? 'online' : ''} ` }>
                    <div className='flex_container '>
                  
                   
                        <p className='flex flex-row justify-normal text-md font-semibold cursor-pointer'>  {isOnline ? <div className='online-dot'></div> : <div className='offline-dot'></div>}{conversation.name}</p>
                        
                    </div>
                </div>
            </div>
            <div className='divider divider-success'></div>
        </>
    );
};

export default Conversation;
