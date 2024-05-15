import React from 'react'
import SearchUser from './SearchUser';
import MessageContainer from './MessageContainer';
import './ChatPage.css' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faMessage } from '@fortawesome/free-solid-svg-icons';

const ChatPage = () => {
  
  return <div className=" bg-slate-100 my-5 rounded-lg shadow-inner">
  
  <div className=" p-2 ">
   <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faComment} className=' text-yellow-500 mx-1'/>CampusComms</h2>
    </div>

  <div className=' p-3 my-2 flex flex-row w-full justify-between'>

    


   
    
    <div className="w-2/4">
      
    <SearchUser/>
    </div>
    <div className="divider divider-horizontal divider-warning mx-2"></div>
    <div className=" w-full ">
    <MessageContainer/>
    </div>
    </div>
    </div>
  
};

export default ChatPage
