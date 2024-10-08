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
<<<<<<< Updated upstream
      <div className='registered_account_container'>
        <h2>Registered Accounts</h2>
        <Tabs
          id="registered-accounts-tabs"
          activeKey={activeTab}
          onSelect={handleTabChange}
          className="mb-3 custom_tabs"
        >
          <Tab eventKey="staff" title="Staff" className='account_tabs'>
            <StaffAccounts />
          </Tab>
          <Tab eventKey="faculty" title="Faculty" className='account_tabs'>
            <FacultyAccounts />
          </Tab>
          <Tab eventKey="student" title="Student" className='account_tabs'>
            <StudentAccounts />
          </Tab>
        </Tabs>
=======
      <div className='bg-slate-100 mt-3 rounded-lg shadow-inner p-2'>
        <h2 className='text-2xltext-green-800 border-b-2 border-yellow-500 py-1 my-1'>Registered Accounts</h2>

        <div role="tablist" className="tabs tabs-lifted w-full">
        <input type="radio" name="my_tabs_2" role="tab" className="tab w-full" aria-label="Staff" />
        <div role="tabpanel" className="tab-content bg-green-200 border-base-300 rounded-box p-6 text-white w-full"><StaffAccounts /></div>

        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Faculty" />
        <div role="tabpanel" className="tab-content bg-green-200 border-base-300 rounded-box p-6 w-full">    <FacultyAccounts /></div>

        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Student" />
        <div role="tabpanel" className="tab-content bg-green-200 border-base-300 rounded-box p-6 w-full"><StudentAccounts /></div>
      </div>
     
>>>>>>> Stashed changes
      </div>
    );
  };

export default RegisteredAccounts;
