import React, { useEffect, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OrganizationReg from '../dboardmodules/OrganizationReg';
import axios from 'axios';
import "./Dashboard.css"
import Conversation from '../ChatModule/Conversation';
import Conversations from '../ChatModule/Conversations';
import CreateEvent from '../dboardmodules/CreateEvent'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import moment from 'moment';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDashboard } from '@fortawesome/free-solid-svg-icons';
import Navbar_2 from '../components/Navbar_2';
import Navbar from '../components/Navbar';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Dashboard = ({ changeBackgroundToColor, conversations }) => {
    const navigate = useNavigate();
    const [adminType, setAdminType] = useState('');
    const [dashboardContent, setDashboardContent] = useState(null);
    const [activeItem, setActiveItem] = useState('item1'); // Initially set to the first item

  const handleItemClick = (itemId) => {
    setActiveItem(itemId); // Update the active item when a navigation button is clicked
  };
    

    useEffect(() => {
        const storedAdminType = localStorage.getItem('adminType');
        if (!storedAdminType) {
            // If admin type is not available, navigate back to login
            navigate('/login');
        } else {
            setAdminType(storedAdminType);
        }
    }, [navigate]);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/check-auth');
                if (!response.data.authenticated) {
                    // If not authenticated, redirect to login
                    navigate('/login');
                } else {
                    // If authenticated, set the admin type
                    setAdminType(localStorage.getItem('adminType'));
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
            }
        };

        checkAuthStatus();
    }, [navigate]);

    // Function to mock dashboard content based on user's role
    const mockDashboardContent = (role) => {
        switch (role) {
            case 'School Owner':
                return (
                    <div>
                        <h2>This is the School Owner dashboard content</h2> 
                    </div>
                );
            case 'President':
                return <div>
                        <h2>This is the President dashboard content</h2>
                        </div>;
            case 'School Executive Admin':
                return <div>
                        <h2>This is the School Executive Admin dashboard content</h2>
                        </div>;
            case 'School Executive Dean':
                return <div>
                        <h2>This is the School Executive Dean dashboard content</h2>
                        </div>;
            case 'Program Head':
                return <div>
                        <h2>This is the Program Head Content</h2>
                        </div>;
            case 'Student Government':
                return <div>
                        <h2>This is the Student Government Content</h2>
                        </div>;
            case 'Organization Officer':
                return <div>
                        <h2>This is the Organization Officer Content</h2>
                        </div>;
            default:
                return <div>No dashboard content available for this role</div>;
        }
    };

    useEffect(() => {
        setDashboardContent(mockDashboardContent(adminType));
    }, [adminType]);



    return (
        
    <div className="dashboard animate-fade-in">
     

        <div className="">
            
           

           <div className=" my-16 flex flex-row  w-auto h-full">

            

       

            <div className="row_1 inline-flex flex-col">

                <div className="p3 m-3 w-auto h-full  shadow-md rounded-3 bg-white border">
                <Carousel showThumbs={false} autoPlay infiniteLoop  interval={10000}>
                        <div>
                        <img src="../src/assets/398569058_739544134860223_1719844830869562449_n.jpg" alt="Slide 1" className=' h-auto' />
                        
                        </div>
                        <div>
                        <img src="../src/assets/434168365_828389249309044_1058040744990472008_n.jpg" alt="Slide 2" className=' max-h-full' />
                      
                        </div>
                        <div>
                        <img src="../src/assets/439841626_847556550725647_7502073539968304278_n.jpg" alt="Slide 3" />
                        
                        </div>
                        
                        
                    </Carousel>
                    </div>
                <div className=' p-3 m-3 w-auto h-full  shadow-md rounded-3 bg-white border'>
                <h2 className='text-3xl border-b-2 border-gray-700'>Analytics</h2>

                <div className="inline-flex flex-row">
                    <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full shadow-md rounded-2 border">
                    <h6 className='text-3xl'>Recent Post</h6>

                    
  
                        <div className="stat">
                            <div className="stat-title">Total Page Views</div>
                            <div className="stat-value">89,400</div>
                            <div className="stat-desc">21% more than last month</div>
                        </div>
                        
                        </div>

                    

                    <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                    <h6 className='text-3xl'>Top Post</h6>

                    <div className="stat">
                        <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </div>
                        <div className="stat-title">Total Likes</div>
                        <div className="stat-value text-primary">25.6K</div>
                        <div className="stat-desc">21% more than last month</div>
                    </div>
                    </div>
                    
                </div>

                </div>

                <div className=" p-3 m-3  w-auto h-full shadow-inner shadow-md rounded-3 bg-white ">
                <h2 className='text-3xl border-b-2 border-gray-700 py-1'>My Community</h2>


                <div className="container flex flex-row w-auto h-auto">

                <div className=" p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                <div className="flex flex-col gap-4 w-52">
                    <div className="flex gap-4 items-center">
                        <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                        <div className="flex flex-col gap-4">
                        <div className="skeleton h-4 w-20"></div>
                        <div className="skeleton h-4 w-28"></div>
                        </div>
                    </div>
                    <div className="skeleton h-32 w-full"></div>
                    </div>
                </div>

                <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                <div className="flex flex-col gap-4 w-52">
                    <div className="flex gap-4 items-center">
                        <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                        <div className="flex flex-col gap-4">
                        <div className="skeleton h-4 w-20"></div>
                        <div className="skeleton h-4 w-28"></div>
                        </div>
                    </div>
                    <div className="skeleton h-32 w-full"></div>
                    </div>
                </div>

                <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                <div className="flex flex-col gap-4 w-52">
                    <div className="flex gap-4 items-center">
                        <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                        <div className="flex flex-col gap-4">
                        <div className="skeleton h-4 w-20"></div>
                        <div className="skeleton h-4 w-28"></div>
                        </div>
                    </div>
                    <div className="skeleton h-32 w-full"></div>
                    </div>
                </div>

          
                
                </div>
                


                
                
               
  
       

              </div>

                

                
            </div>

               <div className="row_2 flex flex-col">

                
               <div className="p-3 m-3 w-auto shadow-inner  rounded-3 bg-white transition-transform duration-300 ease-in-out transform hover:scale-95">
      
                <CreateEvent defaultSelectable={false}/>
                </div>
               

                
                <div className="p-2 m-3  w-auto shadow-inner  rounded-3 bg-white ">
                    <div className="flex border-b-2 border-gray-700">
                        <div className='online-dot m-2'></div>
                        <div className="">
                        <h2 className='text-3xl '>User List</h2>
                        </div>
                    </div>


                    <div className=" py-2 ">

                    <Conversations conversations={{conversations}} className='active_'/>
                    </div>
                
                
                </div>
              

                </div>

           

                
  
            
            </div>

                
          

          



           
            
        </div>
    </div>
    );
};

export default Dashboard;
