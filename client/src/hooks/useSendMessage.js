import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useConversation from '../zustand/useConversation';

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  const sendMessage = async (message) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await axios.post(
        `/api/messages/send/${selectedConversation._id}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = res.data;
      if (data.error) throw new Error(data.error);

      setMessages([...messages, data]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
