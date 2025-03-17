import React, { useState, useEffect } from 'react'
import useConversation from '../zustand/useConversation'
import axios from 'axios';
import toast from 'react-hot-toast'

const useGetMessages = () => {
    const[loading,setLoading] = useState(false)
    const{messages, setMessages, selectedConversation} = useConversation();

    const getToken = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!token) {
          throw new Error('Token not found');
        }
        return token.split('=')[1];
      };

  useEffect(()=>{
    const getMessages = async ()=>{
        setLoading(true);
        try {
            const token = getToken(); 
            const res = await axios.get(`/api/messages/${selectedConversation._id}`,{
                headers: {
                    Authorization: `Bearer ${token}`, 
                  },   
            });
            const data = await res.data;

            if(data.error) throw new Error(data.error)
            setMessages(data)
        } catch (error) {
            toast.error(error.message)
        }finally{
            setLoading(false)
        }
    }
    if(selectedConversation?._id) getMessages();
  },[selectedConversation?._id, setMessages]);
  return{messages, loading};
};

export default useGetMessages
