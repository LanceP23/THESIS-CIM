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
import MyCommunity from './dboardmodules/MyCommunityModule/MyCommunity';
import BuildCommunity from './dboardmodules/MyCommunityModule/BuildCommunity';
import ViewCommunity from './dboardmodules/MyCommunityModule/ViewCommunity';
import RecentPostCommunity from './dboardmodules/MyCommunityModule/RecentPostCommunity';
import NotificationBell from './components/NotificationBell';
import Navbar_2 from './components/Navbar_2';
import address from 'address';
import CreateEvent from './dboardmodules/CreateEvent';
import Analytics_report from './dboardmodules/Analytics_report';
import Eventcalendar from './dboardmodules/MyCommunityModule/Eventcalendar';
import Notification_module from './components/Notification_module'

const baseURL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'http://192.168.239.132:8000';
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

function App() {



  return (
    <div >
      
    <UserContextProvider>
  
      <SocketContextProvider>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      <Navbar_2/>
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
        <Route path="/community-landing" element={<MyCommunity />}  />
        <Route path="/build-community" element={<BuildCommunity/>} />
        <Route path="/view-community" element={<ViewCommunity/>} />
        <Route path="/create-event" element={<CreateEvent/>} />
        <Route path="/analytics-report" element={<Analytics_report/>} />
        <Route path="/event-calendar" element={<Eventcalendar/>} />
        <Route path="/notif-module" element={<Notification_module/>} />

      </Routes>
      </SocketContextProvider>
    </UserContextProvider>
    </div>
  );
}

export default App; 
