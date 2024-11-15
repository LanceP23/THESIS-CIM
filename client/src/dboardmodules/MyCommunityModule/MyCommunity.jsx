import React,{useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCommunit.css'; 
import axios from 'axios';
import { useEffect } from 'react';
export default function MyCommunity() {
  const [hovered_Build_Community, sethovered_Build_Community] = useState('');
  const [hovered_View_Community, setHovered_View_Community] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('/check-auth');
            if (!response.data.authenticated) {
                // If not authenticated, redirect to login
                navigate('/login');
            } 
        } catch (error) {
            console.error('Error checking authentication status:', error);
        }
    };
    checkAuthStatus();
}, [navigate]);
  const handleBuildCommunity = () => {
    navigate('/build-community');
  };
  const handleViewCommunity = () => {
    navigate('/view-community');
  };
  
  return (
    <div className=" mt-16  ml-14 mr-3 pt-6 ">
    <div className=" bg-slate-200 rounded-xl p-2 animate-fade-in w-full ">
      <h2 className='text-2xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl  text-green-800 border-b-2 border-yellow-500 py-2'>Welcome to the Community Management Module</h2>
      
      <div className=" py-3 grid grid-cols-1 sm: md: lg:grid lg:grid-cols-2 xl:grid xl:grid-cols-2 justify-center justify-items-center  w-full"> 
      
      <div 
        className=" my-2  sm:my-1 md:my-1 lg:my-0 xl:my-0 card w-96 glass p-0 relative transition-transform duration-300 ease-in-out transform hover:scale-95 shadow-2xl " 
        onMouseEnter={() => sethovered_Build_Community(true)} 
        onMouseLeave={() => sethovered_Build_Community(false)}
      >
        <img src="/assets/community.jpg" alt="" className='w-full shadow-2xl'/>
        <div className="card-body">
          <h2 className="card-title border-b-2 border-yellow-500 text-green-700">Build Community</h2>
          <p className='text-justify text-gray-600 '>Create a vibrant community within CIM. Your ideas, passion, and involvement are the keys in building a collaborative and inclusive environment.</p>
          <div className="card-actions justify-end">
           
          </div>
        </div>
        {hovered_Build_Community && (
          <div className="absolute top-0 left-0 w-full h-full rounded-xl bg-green-800 bg-opacity-50 flex justify-center items-center transition duration-300 animate-fade-in cursor-pointer"
          onClick={handleBuildCommunity}
          >
            
            <p className="text-white text-3xl font-semibold">Start Building Community Now!</p>
          </div>
        )}
      </div>
      <div 
        className="my-2 sm:my-1 md:my-1 lg:my-0 xl:my-0 card w-96 glass p-0 relative transition-transform duration-300 ease-in-out transform hover:scale-95 shadow-2xl" 
        onMouseEnter={() => setHovered_View_Community(true)} 
        onMouseLeave={() => setHovered_View_Community(false)}
      >
        <img src="/assets/commu.png" alt="" className=' h-auto w-full'/>
        <div className="card-body">
          <h2 className="card-title  border-b-2 border-yellow-500 text-green-700">View Community</h2>
          <p className='text-justify text-gray-600'>Discover the vibrant community within CIM. Connect, engage, and see how you can make a difference today.</p>
          <div className="card-actions justify-end">
            
          </div>
        </div>
        {hovered_View_Community && (
          <div className="absolute top-0 left-0 w-full h-full rounded-xl bg-green-800  bg-opacity-50 flex justify-center items-center transition duration-300 animate-fade-in cursor-pointer"
          onClick={handleViewCommunity}
          >
            
            <p className="text-white text-3xl font-semibold" >View Community</p>
          </div>
        )}
      </div>
          
       
        
      </div>
    </div>
    </div>
  );
}