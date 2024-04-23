import React from 'react';
import useConversation from '../zustand/useConversation';
import { useSocketContext } from '../../context/socketContext';

const Conversation = ({ conversation, lastIdx }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    const isSelected = selectedConversation?.id === conversation._id;

    return (
        <>
            <div
                className={`flex gap-2 items-center hover:bg-gray-500 rounded p-2 cursor-pointer ${
                    isSelected ? 'bg-gray-500' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
            >
                <div className={`flex flex-col flex-1 ${isOnline ? 'online' : ''}`}>
                    <div className='flex gap-3 justify-between'>
                        <p className='font-bold text-gray-200'>{conversation.name}</p>
                        {isOnline ? <div className='online-dot'></div> : <div className='offline-dot'></div>}
                    </div>
                </div>
            </div>
            <div className='divider my-0 py-0 h-1'></div>
        </>
    );
};

export default Conversation;
