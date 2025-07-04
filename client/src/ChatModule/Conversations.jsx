import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Conversation from './Conversation';
import axios from 'axios';
import useGetConversations from '../hooks/useGetConversations';
import './ChatPage.css' 

const Conversations = ({}) => {
    const { loading, conversations } = useGetConversations();
  return (
    <div className=' flex flex-col max-h-96 overflow-auto w-full '>
        {conversations.map((conversation, idx)=>(
            <Conversation
            key={conversation._id}
            conversation={conversation}
            lastIdx = {idx === conversations.length - 1}
            />
        ))}



      {loading?<span className='loading loading-spinner mx-auto'></span> : null}
    </div>
  );
};

export default Conversations;
