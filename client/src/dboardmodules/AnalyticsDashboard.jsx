import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';

const AnalyticsDashboard = () => {
  const { user } = useContext(UserContext);
  const [likesChange, setLikesChange] = useState(0);
  const [dislikesChange, setDislikesChange] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalDislikes, setTotalDislikes] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/check-auth');
        if (!response.data.authenticated) {
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
        const response = await axios.get(`/count-reactions-date/${user.id}`);
        const newTotalLikes = response.data.formattedData.reduce((sum, data) => sum + data.likes, 0);
        const newTotalDislikes = response.data.formattedData.reduce((sum, data) => sum + data.dislikes, 0);

        const newLikesChange = newTotalLikes - totalLikes;
        const newDislikesChange = newTotalDislikes - totalDislikes;

        setLikesChange(newLikesChange);
        setDislikesChange(newDislikesChange);
        setTotalLikes(newTotalLikes);
        setTotalDislikes(newTotalDislikes);
        
        setAnalyticsData({
          formattedData: response.data.formattedData,
          totalLikes: newTotalLikes,
          totalDislikes: newTotalDislikes,
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    if (user) {
      fetchData(); // Initial fetch on mount
      const intervalId = setInterval(fetchData, 10000); // Polling every 10 seconds
      return () => clearInterval(intervalId);
    }
  }, [user, totalLikes, totalDislikes]);

  const totalPosts = totalLikes + totalDislikes;
  const netReactions = totalLikes - totalDislikes; 
  const engagementPercentage = totalPosts > 0 ? ((totalLikes / totalPosts) * 100).toFixed(2) : 0;
  const likesToDislikesRatio = totalDislikes > 0 ? (totalLikes / totalDislikes).toFixed(2) : totalLikes > 0 ? "Infinity" : "N/A";

  return (
    <div className="flex flex-col md:flex-row my-5 w-full h-full animate-fade-in justify-center items-center">
      {totalPosts === 0 ? (
        <div className="text-center w-full">
          <p className="text-red-500 text-lg">No analytics data available.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row w-full">
          <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md mx-2 mb-4 md:mb-0 flex-1">
            <h2 className="text-xl font-bold mb-2 border-b-2 border-yellow-500 pb-1">
              <FontAwesomeIcon icon={faChartBar} className="text-yellow-500 mx-1" /> Reactions Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="stat flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                <div>
                  <div className="stat-title text-md text-gray-600">Total Likes</div>
                  <div className="stat-value text-3xl font-bold">{totalLikes}</div> {/* Reduced size and removed color */}
                </div>
                <div className="stat-icon flex items-center">
                  <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" />
                  <span className={`text-md ml-2 ${likesChange > 0 ? 'text-green-500' : likesChange < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                    {likesChange !== 0 ? (likesChange > 0 ? `+${likesChange}` : `${likesChange}`) : 'No Change'} likes
                  </span>
                </div>
              </div>
              <div className="stat flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                <div>
                  <div className="stat-title text-md text-gray-600">Total Dislikes</div>
                  <div className="stat-value text-3xl font-bold">{totalDislikes}</div> {/* Reduced size and removed color */}
                </div>
                <div className="stat-icon flex items-center">
                  <FontAwesomeIcon icon={faThumbsDown} className="text-red-500" />
                  <span className={`text-md ml-2 ${dislikesChange > 0 ? 'text-green-500' : dislikesChange < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                    {dislikesChange !== 0 ? (dislikesChange > 0 ? `+${dislikesChange}` : `${dislikesChange}`) : 'No Change'} dislikes
                  </span>
                </div>
              </div>
            </div>
            <div className="stat flex justify-between items-center mt-4 bg-gray-100 p-4 rounded-lg">
              <div className="stat-title text-md text-gray-600">Net Reactions</div>
              <div className="stat-value text-2xl font-semibold">{netReactions}</div>
            </div>
            <div className="stat flex justify-between items-center mt-2 bg-gray-100 p-4 rounded-lg">
              <div className="stat-title text-md text-gray-600">Engagement Rate (%)</div>
              <div className="stat-value text-2xl font-semibold">{engagementPercentage}%</div>
            </div>
            <div className="stat flex justify-between items-center mt-2 bg-gray-100 p-4 rounded-lg">
              <div className="stat-title text-md text-gray-600">Likes to Dislikes Ratio</div>
              <div className="stat-value text-2xl font-semibold">{likesToDislikesRatio}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
