import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OrganizationReg from '../dboardmodules/OrganizationReg';
import axios from 'axios';
import "./Dashboard.css";
import Conversation from '../ChatModule/Conversation';
import Conversations from '../ChatModule/Conversations';
import CreateEvent from '../dboardmodules/CreateEvent';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faCalendarDay, faDashboard, faUser , faThumbsUp, faThumbsDown} from '@fortawesome/free-solid-svg-icons';
import Navbar_2 from '../components/Navbar_2';
import Navbar from '../components/Navbar';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import CommCalendar from '../dboardmodules/CommCalendar';
import AnalyticsDashboard from '../dboardmodules/AnalyticsDashboard';

const Dashboard = ({ changeBackgroundToColor, conversations }) => {
    const navigate = useNavigate();
    const [adminType, setAdminType] = useState('');
    const [dashboardContent, setDashboardContent] = useState(null);
    const [activeItem, setActiveItem] = useState('item1'); // Initially set to the first item
    const [recentPosts, setRecentPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [communityAnnouncements, setCommmunityAnnouncements] = useState([]);
    const [adminLoginsToday, setAdminLoginsToday] = useState(0);
    
    const handleItemClick = (itemId) => {
        setActiveItem(itemId); // Update the active item when a navigation button is clicked
    };

    const handleConversationClick = (conversationId) => {
        // Navigate to the campcomms route with the conversation ID as a parameter
        navigate(`/campcomms/${conversationId}`);
    };

    const getToken = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!token) {
            throw new Error('Token not found');
        }
        return token.split('=')[1];
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    useEffect(() => {
        const fetchRandomAnnouncements = async () => {
            try {
                const token = getToken();
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get('/random-announcements', config);
                const shuffledPosts = shuffleArray(response.data);
                setRecentPosts(shuffledPosts);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching random community and recent posts:', error);
            }
        };

        fetchRandomAnnouncements();
    }, []);

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

    useEffect(() => {
        const fetchAdminLoginsToday = async () => {
            try {
                const token = getToken();
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get('/admin-logins-today', config);
                setAdminLoginsToday(response.data.loginCount);
            } catch (error) {
                console.error('Error fetching admin logins today:', error);
            }
        };

        fetchAdminLoginsToday();
    }, []);

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
                <div className=" mt-16 h-full flex xl:flex-row flex-col md:flex-col sm:flex-col ">
                    <div className="row_1 inline-flex flex-col xl:w-2/3 h-full ">
                        <div className="p3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100 border-2 ">
                            <Carousel showThumbs={false} autoPlay infiniteLoop interval={10000}>
                                <div>
                                    <img src="/assets/398569058_739544134860223_1719844830869562449_n.jpg" alt="Slide 1" className=' h-auto' />
                                </div>
                                <div>
                                    <img src="/assets/434168365_828389249309044_1058040744990472008_n.jpg" alt="Slide 2" className=' max-h-full' />
                                </div>
                                <div>
                                    <img src="/assets/439841626_847556550725647_7502073539968304278_n.jpg" alt="Slide 3" />
                                </div>
                             
                            </Carousel>
                        </div>
                        <div className='p-3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100  hover:shadow-2xl border-2'>
                            <Link to="/analytics-report" className=''>
                                <h2 className='text-3xl border-b-2 border-gray-700 hover:text-yellow-400 hover:border-yellow-400'>Analytics</h2>
                                <AnalyticsDashboard/>
                            </Link>
                        </div>
                        <div className="p-3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100 hover:shadow-2xl border-2">
                            {adminType === 'Organization Officer' ? (
                                // Display as non-clickable if the user is "Organization President"
                                <div className=''>
                                    <h2 className='text-3xl border-b-2 border-gray-700 py-1 text-gray-500'>My Community (Restricted)</h2>
                                    <div className="flex flex-col xl:flex-row lg:flex-row md:flex-col sm:flex-col w-auto h-auto md:w-2/4">
                                    {recentPosts
                                        .filter(post => post.announcement && post.community)
                                        .slice(0, 3)
                                        .map((post, index) => (
                                        <div key={index} className="p-0 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-full h-full max-h-auto shadow-md rounded-2 border flex justify-center">
                                            <div className="flex flex-col gap-4 w-auto">
                                            <div className="flex gap-4 justify-center items-center h-[10rem] m-2">
                                                <img src={post.community.logo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="Community Logo" className="w-16 h-16 rounded-full" />
                                                <div className="flex flex-col gap-4">
                                                <h3 className="xl:text-xl text-lg font-semibold text-green-800 border-b border-yellow-400 text-left">{post.community.name}</h3>
                                                <p>{post.announcement.header}</p>
                                                </div>
                                            </div>

                                            <div>
                                                {post.announcement.mediaUrl ? (
                                                post.announcement.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif)$/i.test(post.announcement.mediaUrl) ? (
                                                    <img src={post.announcement.mediaUrl} alt="image" className="w-auto rounded-lg" />
                                                ) : (
                                                    <video controls className="w-full h-96 rounded-lg">
                                                    <source src={post.announcement.mediaUrl} type={post.announcement.contentType || 'video/mp4'} />
                                                    Your browser does not support the video tag.
                                                    </video>
                                                )
                                                ) : (
                                                <div className="w-full h-96 flex items-center justify-center border rounded-lg">
                                                    <p className="text-gray-500">{post.announcement.body}</p>
                                                </div>
                                                )}
                                            </div>

                                            
                                                                            <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faThumbsUp} className="text-green-700" />
                                                <span className="text-green-700 font-semibold">{post.announcement.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faThumbsDown} className="text-red-600" />
                                                <span className="text-red-600 font-semibold">{post.announcement.dislikes}</span>
                                            </div>
                                            </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Display as clickable if the user is not "Organization President"
                                <Link to="/community-landing" className=''>
                                    <h2 className='text-3xl border-b-2 border-gray-700 py-1 hover:text-yellow-400 hover:border-yellow-400'>My Community</h2>
                                    <div className="flex flex-col xl:flex-row lg:flex-row md:flex-col sm:flex-col w-auto h-auto md:w-2/4">
                                    {recentPosts
                                        .filter(post => post.announcement && post.community)
                                        .slice(0, 3)
                                        .map((post, index) => (
                                        <div key={index} className="p-0 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-full h-full max-h-auto shadow-md rounded-2 border flex justify-center">
                                            <div className="flex flex-col gap-4 w-auto">
                                            <div className="flex gap-4 justify-center items-center h-[10rem] m-2">
                                                <img src={post.community.logo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="Community Logo" className="w-16 h-16 rounded-full" />
                                                <div className="flex flex-col gap-4">
                                                <h3 className="xl:text-xl text-lg font-semibold text-green-800 border-b border-yellow-400 text-left">{post.community.name}</h3>
                                                <p>{post.announcement.header}</p>
                                                </div>
                                            </div>

                                            <div>
                                                {post.announcement.mediaUrl ? (
                                                post.announcement.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif)$/i.test(post.announcement.mediaUrl) ? (
                                                    <img src={post.announcement.mediaUrl} alt="image" className="w-auto rounded-lg" />
                                                ) : (
                                                    <video controls className="w-full h-96 rounded-lg">
                                                    <source src={post.announcement.mediaUrl} type={post.announcement.contentType || 'video/mp4'} />
                                                    Your browser does not support the video tag.
                                                    </video>
                                                )
                                                ) : (
                                                <div className="w-full h-96 flex items-center justify-center border rounded-lg">
                                                    <p className="text-gray-500">{post.announcement.body}</p>
                                                </div>
                                                )}
                                            </div>

                                            {/* Likes and Dislikes Section */}
                                            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faThumbsUp} className="text-green-700" />
                <span className="text-green-700 font-semibold">{post.announcement.likes }</span>
              </div>
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faThumbsDown} className="text-red-600" />
                <span className="text-red-600 font-semibold">{post.announcement.dislikes }</span>
              </div>
            </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>

                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="row_2 flex flex-col xl:w-1/3 lg:full float-right">
                        <div className="p-3 m-3 w-auto h-auto shadow-inner rounded-3 bg-slate-100  hover:shadow-2xl  border-2">
                            <div className="">
                                <CommCalendar defaultSelectable={false} />
                            </div>
                            <div className="mt-4">
                                <Link to="/event-calendar" className='btn-link p-0 btn-success '>
                                    <p className='text-green-400 hover:text-yellow-300'>
                                        <FontAwesomeIcon icon={faCalendarCheck} /> View Full Calendar
                                    </p>
                                </Link>
                            </div>
                        </div>
                        <div className="p-2 m-3 my-2 w-auto shadow-inner rounded-3 bg-slate-100  border-2">
                            <Link to="/campcomms" className=''>
                                <div className="flex border-b-2 border-gray-700">
                                    <div className='online-dot m-2'></div>
                                    <div className="">
                                        <h2 className='text-3xl'>User List</h2>
                                    </div>
                                </div>
                                <div className="py-2 hover:shadow-2xl">
                                    <Conversations conversations={{ conversations }} className='active_' />
                                </div>
                            </Link>
                        </div>
                        <div className="mt-4">

                        <div className="bg-slate-100 p-3  rounded-lg  shadow-slate-950 mx-3  mb-4 md:mb-0">
                            <h2 className="text-2xl text-black border-b-2 border-black py-2">
                            <FontAwesomeIcon className="text-yellow-500 mx-1" />Total Login 
                            </h2>
                            <div className="p-2 my-1 md:p-5 lg:p-10 md:m-2 lg:m-5 h-auto shadow-md rounded-2 border">
                            <div className="stat items-center flex">
                                <div className="stat-title text-gray-500 hidden sm:hidden md:block lg:block xl:block">Number of admin logins today:</div>
                                <div className="stat-value">{adminLoginsToday} <FontAwesomeIcon icon= {faUser} className=' text-green-500'/></div>
                                
                                
                                
                            </div>
                            </div>
                        </div>
                          
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
