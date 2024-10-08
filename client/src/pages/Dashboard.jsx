import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OrganizationReg from '../dboardmodules/OrganizationReg';
import "./Dashboard.css"
const Dashboard = () => {
    const navigate = useNavigate();
    const [adminType, setAdminType] = useState('');
    const [dashboardContent, setDashboardContent] = useState(null);

    useEffect(() => {
        const storedAdminType = localStorage.getItem('adminType');
        if (!storedAdminType) {
            // If admin type is not available, navigate back to login
            navigate('/login');
        } else {
            setAdminType(storedAdminType);
        }
    }, [navigate]);

    // Function to mock dashboard content based on user's role hardcoded hehe
    const mockDashboardContent = (role) => {
        switch (role) {
            case 'School Owner':
                return (
                    <div>
                        
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
<<<<<<< Updated upstream
        <div className="dashboard">
            <Sidebar adminType={adminType} />
            <div className="dashboard-content">
                <div className='Column_1'>
=======
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
                        <div className="p-3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100  hover:shadow-2xl  border-2">
                            <Link to="/community-landing" className=''>
                                <h2 className='text-3xl border-b-2 border-gray-700 py-1 hover:text-yellow-400 hover:border-yellow-400'>My Community</h2>
                                <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row 2xl:fle w-auto h-auto md:w-2/4">
                                    {recentPosts
                                        .filter(post => post.announcement && post.community) // Filter out posts without announcement or community
                                        .slice(0, 3) // Limit to three posts
                                        .map((post, index) => (
                                            <div key={index} className="p-0 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-full h-full max-h-auto shadow-md rounded-2 border flex justify-center">
                                                <div className="flex flex-col gap-4 w-auto">
                                                    <div className="flex gap-4 justify-center items-center h-[10rem] m-2">
                                                        <img src={post.community.logo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" } alt="Community Logo" className="w-16 h-16 rounded-full" />
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
>>>>>>> Stashed changes

               
                    <div className="Analytics_section">
                    <h2>Analytics</h2>

                    </div>

                    <div className="My_community_section">
                    <h2>My Community</h2>

                    </div>
               </div>

                <div className="Column_2">


               
               <div className="School_calendar_section">
               <h2>School calendar</h2>

               </div>
               <div className="Active_user_section">
               <h2>Active User</h2>
               </div>

               </div>
                {dashboardContent ? (
                    <div>{dashboardContent}</div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
