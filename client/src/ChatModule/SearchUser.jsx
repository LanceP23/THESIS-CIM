import React from 'react'
import SearchInput from './SearchInput'
import Conversations from './Conversations'
import './ChatPage.css' 
export default function SearchUser() {
  return (
    
      <div>
      <SearchInput/>
      <div className = "divider divider-warning"></div>
      <Conversations/>

    </div>
  )
}
