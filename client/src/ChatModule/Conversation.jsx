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
                  
                   
                    <div className='flex flex-col justify-normal text-md font-semibold cursor-pointer text-left'>
                    <p>{conversation.name}</p>
                        {isOnline ?  
                        <div
                            class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20 w-fit ">
                            <div class="absolute w-4 h-4 top-2/4 left-1 -translate-y-2/4">
                            <span class="mx-auto mt-1 block h-2 w-2 rounded-full bg-green-900 content-['']"></span>
                        </div>
                            <span class="ml-4">Online</span>
                        </div> 
                        : 
                        <div
                            class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-red-900 uppercase rounded-md select-none whitespace-nowrap bg-red-500/20 w-fit">
                            <div class="absolute w-4 h-4 top-2/4 left-1 -translate-y-2/4">
                            <span class="mx-auto mt-1 block h-2 w-2 rounded-full bg-red-900 content-['']"></span>
                            </div>
                            <span class="ml-4">Offline</span>
                        </div>
                        }
                        
                    </div>

                    
                        
                    </div>
                </div>
            </div>
            <div className='divider divider-success'></div>
        </>
    );
};

export default Conversation;
