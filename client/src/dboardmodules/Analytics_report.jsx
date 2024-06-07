import React, { useContext, useEffect, useState } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { UserContext } from '../../context/userContext';
import { format, parseISO } from 'date-fns';

const Analytics_report = () => {
  const { user } = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState(null);

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

  // Calculate average likes and dislikes per post
  const avgLikesPerPost = totalPosts > 0 ? Math.round(likes / totalPosts) : 0;
  const avgDislikesPerPost = totalPosts > 0 ? Math.round(dislikes / totalPosts) : 0;

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
  
  console.log('Reactions by Date:', reactionsByDate);

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
    <div className='flex flex-col md:flex-row my-5 w-full h-full animate-fade-in'>
      {totalPosts === 0 ? (
        <div className="text-center w-full">
          <p className="text-red-500">No analytics data available.</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 w-full md:w-1/2 lg:w-1/3 mx-2 mb-4 md:mb-0">
            <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>
              <FontAwesomeIcon icon={faChartBar} className=' text-yellow-500 mx-1' />Reactions
            </h2>
            <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 h-auto shadow-md rounded-2 border">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current text-success">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <div className="stat-title">Total Likes</div>
                <div className="stat-value text-primary text-success">{likes}</div>
                <div className="stat-desc">21% more than last month</div>
                <div className="stat-title">Total Dislikes</div>
                <div className="stat-value text-primary text-success">{dislikes}</div>
                <div className="stat-desc">21% more than last month</div>

                <div className="stat-title">Like-to-Dislike Ratio</div>
                <div className="stat-value text-primary text-success">{totalPosts > 0 ? (likes / dislikes).toFixed(2) : 0}</div>
              </div>
            </div>
          </div>

          {/* BarChart for Total Likes and Dislikes */}
          {reactionsWithDates && reactionsWithDates.length > 0 && (
            <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 w-full md:w-1/2 lg:w-1/3 mx-2 mb-4 md:mb-0">
            <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>
              <FontAwesomeIcon icon={faChartBar} className='text-yellow-500 mx-1' />User Reactions (Bar Chart)
            </h2>
            <BarChart
              dataset={aggregatedReactions.map(reaction => ({
                date: reaction.date,
                likes: reaction.likes,
                dislikes: reaction.dislikes,
              }))}
              yAxis={[
                { scaleType: 'linear', dataKey: 'likes', label: 'Likes', ticks: true },
                { scaleType: 'linear', dataKey: 'dislikes', label: 'Dislikes', ticks: true }
              ]}
              series={[
                { dataKey: 'likes', label: 'Likes' },
                { dataKey: 'dislikes', label: 'Dislikes' }
              ]}
              tooltip={{ content: <CustomTooltipContent /> }}
              className="w-full" 
              height={300} 
            />
          </div>
          )}
          

          {/* LineChart for User Reactions Over Time */}
          {reactionsWithDates && reactionsWithDates.length > 0 && (
            <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 w-full md:w-1/2 lg:w-1/3 mx-2">
              <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>
                <FontAwesomeIcon icon={faChartLine} className=' text-yellow-500 mx-1' />User Reactions (Line Chart)
              </h2>
              <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 h-auto shadow-md rounded-2 border">
                <LineChart
                  dataset={aggregatedReactions.map(reaction => ({
                    date: reaction.date,
                    likes: reaction.likes,
                    dislikes: reaction.dislikes,
                  }))}
                  yAxis={[
                    { scaleType: 'linear', dataKey: 'likes', label: 'Likes', ticks: true },
                    { scaleType: 'linear', dataKey: 'dislikes', label: 'Dislikes', ticks: true }
                  ]}
                  series={[
                    { dataKey: 'likes', label: 'Likes' },
                    { dataKey: 'dislikes', label: 'Dislikes' }
                  ]}
                  tooltip={{ content: <CustomTooltipContent /> }}
                  className="w-full" 
                  height={300} 
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics_report;
