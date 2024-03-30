import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import StaffAccounts from './StaffAccounts';
import FacultyAccounts from './FacultyAccounts';
import StudentAccounts from './StudentAccounts';

const RegisteredAccounts = () => {
    const [activeTab, setActiveTab] = useState('staff'); 
  
    const handleTabChange = (tab) => {
      setActiveTab(tab);
    };
  
    return (
      <div>
        <h2>Registered Accounts</h2>
        <Tabs
          id="registered-accounts-tabs"
          activeKey={activeTab}
          onSelect={handleTabChange}
          className="mb-3"
        >
          <Tab eventKey="staff" title="Staff">
            <StaffAccounts />
          </Tab>
          <Tab eventKey="faculty" title="Faculty">
            <FacultyAccounts />
          </Tab>
          <Tab eventKey="student" title="Student">
            <StudentAccounts />
          </Tab>
        </Tabs>
      </div>
    );
  };

export default RegisteredAccounts;
