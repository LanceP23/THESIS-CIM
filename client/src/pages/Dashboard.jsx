import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OrganizationReg from '../dboardmodules/OrganizationReg';
import axios from 'axios';
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
        <div className="dashboard">
        <Sidebar adminType={adminType} />
        <div className="dashboard-content">
            <div className='Column_1'>

           
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
            
        </div>
    </div>
    );
};

export default Dashboard;
