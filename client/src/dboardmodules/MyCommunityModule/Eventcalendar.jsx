import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CreateEvent from '../CreateEvent';
import "./Eventcalendar.css"
const Eventcalendar = () => {
  return (
    <div className='bg-slate-100 p-3 my-5 rounded-3xl shadow-inner shadow-slate-950  h-auto'>
        <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 my-2'>  <FontAwesomeIcon icon={ faCalendarCheck} className=' text-yellow-500 mx-1'/>Event Calendar</h2>
       <div className='p-3'>
       <CreateEvent />
       </div>
    </div>
  )
}

export default Eventcalendar