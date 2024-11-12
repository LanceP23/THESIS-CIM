import React from 'react';
import useConversation from '../zustand/useConversation';
import { useSocketContext } from '../../context/socketContext';
import './ChatPage.css';

const Conversation = ({ conversation, lastIdx }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    const isSelected = selectedConversation?.id === conversation._id;

    const handleClick = () => {
        // Preserve the existing setSelectedConversation logic
        setSelectedConversation(conversation);
    };

    const profilePicture = conversation.profilePicture 
        ? conversation.profilePicture 
        : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"; // Fallback image

    return (
        <>
            <div
                className={`custom-container ${isSelected ? 'selected' : ''} `}
                onClick={handleClick}
            >
                <div className={`container_1${isOnline ? ' online' : ''} `}>
                    <div className='flex_container flex items-center space-x-4'>
                        {/* Smaller Profile Picture beside the name */}
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2">
                                <img src={profilePicture} alt={conversation.name} />
                            </div>
                        </div>

                        <div className='flex flex-col justify-normal text-md font-semibold cursor-pointer text-left'>
                            <p>{conversation.name}</p>
                            {isOnline ? (
                                <div
                                    className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20 w-fit"
                                >
                                    <div className="absolute w-4 h-4 top-2/4 left-1 -translate-y-2/4">
                                        <span className="mx-auto mt-1 block h-2 w-2 rounded-full bg-green-900 content-['']"></span>
                                    </div>
                                    <span className="ml-4">Online</span>
                                </div>
                            ) : (
                                <div
                                    className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-red-900 uppercase rounded-md select-none whitespace-nowrap bg-red-500/20 w-fit"
                                >
                                    <div className="absolute w-4 h-4 top-2/4 left-1 -translate-y-2/4">
                                        <span className="mx-auto mt-1 block h-2 w-2 rounded-full bg-red-900 content-['']"></span>
                                    </div>
                                    <span className="ml-4">Offline</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className='divider divider-success'></div>
        </>
    );
};

export default Conversation;
