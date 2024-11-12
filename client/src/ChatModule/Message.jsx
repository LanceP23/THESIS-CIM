import React, { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import useConversation from '../zustand/useConversation';
import { extractDateTime } from '../utilities/extractTime';
import './ChatPage.css';

const Message = ({ message }) => {
    const { user } = useContext(UserContext);
    const { selectedConversation } = useConversation();  // Get the current conversation
    const fromMe = message.senderId === user.id;
    const formattedDateTime = extractDateTime(message.createdAt);

    // Get the profile picture from the selected conversation (fallback if not available)
    const profilePicture = selectedConversation?.profilePicture
        ? selectedConversation.profilePicture
        : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"; // Fallback image

    const chatClassName = fromMe ? 'chat-end' : 'chat-start';
    const bubbleBgColor = fromMe ? 'bg-green-500' : '';

    return (
        <div className={`chat ${chatClassName}`}>
            {/* Avatar Image for Sender */}
            {!fromMe && (
                <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2 mr-2">
                        <img src={profilePicture} alt={message.senderName} />
                    </div>
                </div>
            )}
            <div className={`chat-bubble text-white ${bubbleBgColor}`}>
                {message.message}
            </div>
            <div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>
                {formattedDateTime}
            </div>
        </div>
    );
};

export default Message;
