import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import StaffAccounts from './StaffAccounts';
import FacultyAccounts from './FacultyAccounts';
import StudentAccounts from './StudentAccounts';
import './RegisteredAccounts.css'

const RegisteredAccounts = () => {
    const [activeTab, setActiveTab] = useState('staff'); 
  
    const handleTabChange = (tab) => {
      setActiveTab(tab);
    };
  
    return (
      <div className='bg-slate-100 my-5 rounded-lg shadow-inner p-2'>
        <h2 className='text-md text-green-800 border-b-2 border-yellow-500 py-1 my-1'>Registered Accounts</h2>

        <div role="tablist" className="tabs tabs-lifted">
  <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Staff" />
  <div role="tabpanel" className="tab-content bg-green-200 border-base-300 rounded-box p-6 text-white"><StaffAccounts /></div>

  <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Faculty" />
  <div role="tabpanel" className="tab-content bg-green-200 border-base-300 rounded-box p-6">    <FacultyAccounts /></div>

  <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Student" />
  <div role="tabpanel" className="tab-content bg-green-200 border-base-300 rounded-box p-6"><StudentAccounts /></div>
</div>
     
      </div>
    );
  };

export default RegisteredAccounts;
