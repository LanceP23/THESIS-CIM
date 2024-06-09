import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartLine, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons'; // Import the thumbs-up and thumbs-down icons
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { UserContext } from '../../context/userContext';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AnalyticsDashboard = () => {
  const { user } = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get(`/announcements/${user.id}/details`);
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!analyticsData) {
    return <div>Loading...</div>;
  }

  const { likes, dislikes, reactionsWithDates } = analyticsData;

  // Calculate total posts
  const totalPosts = reactionsWithDates.length;

  // Aggregate reactions by date
  const reactionsByDate = reactionsWithDates.reduce((acc, reaction) => {
    const date = format(parseISO(reaction.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { date, likes: 0, dislikes: 0 };
    }
    if (reaction.reaction === 'like') {
      acc[date].likes += 1;
    } else {
      acc[date].dislikes += 1;
    }
    return acc;
  }, {});

  const aggregatedReactions = Object.values(reactionsByDate);

  const CustomTooltipContent = ({ payload }) => {
    if (payload && payload.length) {
      const data = payload[0].payload;
      const formattedDate = format(parseISO(data.date), 'yyyy-MM-dd');
      return (
        <div className="custom-tooltip bg-white p-2 shadow-lg rounded">
          <p>{`Date: ${formattedDate}`}</p>
          <p>{`Likes: ${data.likes}`}</p>
          <p>{`Dislikes: ${data.dislikes}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row my-5 w-full h-full animate-fade-in justify-center items-center">
      {totalPosts === 0 ? (
        <div className="text-center w-full">
          <p className="text-red-500">No analytics data available.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row">
          <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 mx-2 mb-4 md:mb-0">
            <h2 className="text-2xl text-green-800 border-b-2 border-yellow-500 py-2">
              <FontAwesomeIcon icon={faChartBar} className="text-yellow-500 mx-1" />Reactions
            </h2>
            <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 h-auto shadow-md rounded-2 border">
              <div className="stat flex items-center">
                <div className="stat-title">Total Likes</div>
                <div className="stat-value text-primary text-success">{likes}</div>
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" style={{ fontSize: '24px' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 mx-2 mb-4 md:mb-0">
            <h2 className="text-2xl text-green-800 border-b-2 border-yellow-500 py-2">
              <FontAwesomeIcon icon={faChartBar} className="text-yellow-500 mx-1" />Reactions
            </h2>
            <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 h-auto shadow-md rounded-2 border">
              <div className="stat flex items-center">
                <div className="stat-title">Total Dislikes</div>
                <div className="stat-value text-primary text-success">{dislikes}</div>
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faThumbsDown} className="text-green-500" style={{ fontSize: '24px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
