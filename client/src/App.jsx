import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { UserContext, UserContextProvider } from '../context/userContext';
import Dashboard from './pages/Dashboard';
import OrganizationReg from './dboardmodules/OrganizationReg';
import ManageOfficers from './dboardmodules/ManageOrgSubModules/ManageOfficers';
import CreateAnnouncement from './dboardmodules/CreateAnnouncement';
import PostApproval from './dboardmodules/ManagePostSubModules/PostApproval';
import Sidebar from './components/Sidebar';
import ChatPage from './ChatModule/ChatPage';

import React, {useContext, useState} from 'react';
import { SocketContextProvider } from '../context/socketContext';
import UserManagement from './mobileusermanagement/DisplayAllMobileAcc';


axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {



  return (
    <div >
    <UserContextProvider>
      <SocketContextProvider>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      <Sidebar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login  />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createorg" element={<OrganizationReg />} />
        <Route path="/organization/:orgId/officers" element={<ManageOfficers />} />
        <Route path ="/createannouncement" element={<CreateAnnouncement />}/>
        <Route exact path="/post-approval" component={PostApproval} />
        <Route path ="/campcomms" element={<ChatPage/>}/>
        <Route path ="/user-settings" element={<UserManagement/>}/>
      </Routes>
      </SocketContextProvider>
    </UserContextProvider>
    </div>
  );
}

export default App; 
