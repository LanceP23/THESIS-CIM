import React from 'react'
import { useState } from 'react'
import useConversation from '../zustand/useConversation';
import Conversations from './Conversations';
import toast from 'react-hot-toast';
import useGetConversations from '../hooks/useGetConversations';
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
    <form onSubmit={handleSubmit} className='flex items-center gap-2'>
        <input type = "text" placeholder='Search Users...' className='input input-bordered rounded-full'
        value ={search}
        onChange={(e)=> setSearch(e.target.value)}
        />
        <button type = 'submit' className='btn btn-circle'>
        <i className="bi bi-search"></i>
        </button>

    </form>
  )
}

export default SearchInput
