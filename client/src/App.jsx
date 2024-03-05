import './App.css'
import {Routes, Route} from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';
import {Toaster} from 'react-hot-toast';
import { UserContext, UserContextProvider } from '../context/userContext';
import Dashboard from './pages/Dashboard';
import OrganizationReg from './dboardmodules/OrganizationReg';

 axios.defaults.baseURL='http://localhost:8000';
 axios.defaults.withCredentials= true;
function App() {

  return (
    <UserContextProvider>
      <Toaster position = 'top-center' toastOptions={{duration: 2000}}/>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path = '/' element = {<Home/>}/>
        <Route path = '/register' element = {<Register/>}/>
        <Route path = '/login' element ={<Login/>}/>
        <Route path = '/dashboard' element ={<Dashboard/>}/>
        <Route path = '/createorg' element = {<OrganizationReg />}/>
      </Routes>
      
    </UserContextProvider>
  )
}

export default App
