import React, {useEffect, useRef} from 'react'
import Message from './Message'
import useGetMessages from '../hooks/useGetMessages'
import MessageSkeleton from '../skeletons/MessageSkeleton';
import useListenMessages from '../hooks/useListenMessages';
import './ChatPage.css' 

const Messages = () => {
    const {messages, loading} = useGetMessages();
    useListenMessages();

    const scrollableDivRef = useRef(null);

    useEffect(() => {
        const scrollableDiv = scrollableDivRef.current;
        if (scrollableDiv) {
            // Scroll to the bottom when the component mounts
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        }
    }, []);

    useEffect(() => {
      const scrollableDiv = scrollableDivRef.current;
      if (scrollableDiv) {
          // Scroll to the bottom when the messages or loading state changes
          scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      }
  }, [messages, loading]);

  return (
    <div ref={scrollableDivRef} className=' max-h-80 max-w overflow-auto bg-gradient-to-r from-green-300 to-green-100'>
        {!loading&& messages.length>0&& messages.map((message)=>(
            <Message key ={message._id} message ={message}/>
        ))}
    {loading&&[...Array(3)].map((_,idx)=><MessageSkeleton key={idx}/> )}

    {!loading && messages.length===0&&(
        <h5 className=''>Send a message to start a conversation</h5>
    )}
</div>
  )
}

export default Messages
