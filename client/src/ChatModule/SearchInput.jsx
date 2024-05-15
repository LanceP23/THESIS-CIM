import React from 'react'
import { useState } from 'react'
import useConversation from '../zustand/useConversation';
import Conversations from './Conversations';
import toast from 'react-hot-toast';
import useGetConversations from '../hooks/useGetConversations';
import './ChatPage.css' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
const SearchInput = ({}) => {
    const [search, setSearch] = useState("");
	const { setSelectedConversation } = useConversation();
	const { conversations } = useGetConversations();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!search) return;
		if (search.length < 3) {
			return toast.error("Search term must be at least 3 characters long");
		}

		const conversation = conversations.find((c) => c.name.toLowerCase().includes(search.toLowerCase()));

		if (conversation) {
			setSelectedConversation(conversation);
			setSearch("");
		} else toast.error("No such user found!");
	};
  return (
    <form onSubmit={handleSubmit} className=''>
        <input type = "text" placeholder='Search Users...' className='input input-bordered input-success w-full max-w-xs bg-slate-100 input-sm shadow-xl'
        value ={search}
        onChange={(e)=> setSearch(e.target.value)}
        />
        <button type = 'submit' className='btn btn-circle btn-success mx-2 bg-slate-100'>
         <FontAwesomeIcon icon={faSearch} className='search_icon'/>
        </button>

    </form>
  )
}

export default SearchInput
