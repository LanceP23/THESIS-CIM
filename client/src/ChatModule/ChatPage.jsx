import React from 'react'
import SearchUser from './SearchUser';
import MessageContainer from './MessageContainer';
import './ChatPage.css' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faMessage } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import useGetConversations from '../hooks/useGetConversations';
import axios from 'axios';
import { useEffect } from 'react';
const ChatPage = () => {
  const { conversationId } = useParams(); 
  const { loading, conversations } = useGetConversations();
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('/check-auth');
            if (!response.data.authenticated) {
                // If not authenticated, redirect to login
                navigate('/login');
            } 
        } catch (error) {
            console.error('Error checking authentication status:', error);
        }
    };
    checkAuthStatus();
}, [navigate]);
  const selectedConversation = conversations.find(
    (conversation) => conversation._id === conversationId
  );
  
  return <div className="p-1">
  <div className=" bg-slate-100 mt-16 mx-2  rounded-lg shadow-inner animate-fade-in">
  
  <div className=" p-2 ">
   <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faComment} className=' text-yellow-500 mx-1'/>CampusComms</h2>
    </div>
  <div className=' p-3 my-2 flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row  w-full justify-between'>
    
  <div className=" w-full ">
    <MessageContainer />
    </div>
    <div className="divider divider-horizontal sm:divider-vertical md:divider-horizontal lg:divider-horizontal xl:divider-horizontal divider-warning mx-2"></div>
    
    <div className="w-full sm:w-full md:w-2/4 lg:w-2/4 xl:w-2/4 mt-4 sm:mt-5 md:mt-5 lg:mt-0 xl:mt-0 ">
      
    <SearchUser/>
    </div>
   
    
    </div>
    </div>
    </div>
  
};
export default ChatPage