import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Conversation from './Conversation';
import axios from 'axios';
import useGetConversations from '../hooks/useGetConversations';

const Conversations = ({}) => {
    const { loading, conversations } = useGetConversations();
  return (
    <div className='py-2 flex flex-col overflow-y-auto max-h-[500px]'>
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
