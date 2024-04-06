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
      </div>
    );
  };

export default RegisteredAccounts;
