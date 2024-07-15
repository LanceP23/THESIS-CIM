import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartLine, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { UserContext } from '../../context/userContext';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#E38627', '#C13C37', '#6A2135', '#42A5F5', '#66BB6A'];

const Analytics_report = () => {
  const { user } = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [demographicsData, setDemographicsData] = useState(null);
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
        const [detailsResponse, demographicsResponse] = await Promise.all([
          axios.get(`/announcements/${user.id}/details`),
          axios.get(`/user/${user.id}/demographics`)
        ]);

        setAnalyticsData(detailsResponse.data);
        setDemographicsData(demographicsResponse.data.educationLevelCounters);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!analyticsData || !demographicsData) {
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

  const isDemographicsEmpty = Object.values(demographicsData).every(count => count === 0);

  const pieData = Object.entries(demographicsData)
    .filter(([key, value]) => value > 0)
    .map(([key, value], index) => ({
      name: key,
      value,
      color: COLORS[index % COLORS.length]
    }));

  return (
    <div className='flex flex-col my-5 w-full h-full animate-fade-in'>
      {totalPosts === 0 ? (
        <div className="text-center w-full">
          <p className="text-red-500">No analytics data available.</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 w-auto md:w-1/2 lg:w-1/3 mx-2 mb-4 md:mb-0">
            <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>
              <FontAwesomeIcon icon={faChartBar} className='text-yellow-500 mx-1' />Reactions
            </h2>
            <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 h-auto shadow-md rounded-2 border">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" style={{ fontSize: '24px' }} />
                  </div>
                </div>
                <div className="stat-title">Total Likes</div>
                <div className="stat-value text-primary text-success">{likes}</div>
                <div className="stat-desc">21% more than last month</div>
                <div className="stat-title">Total Dislikes</div>
                <div className="stat-value text-primary text-success">{dislikes}</div>
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faThumbsDown} className="text-green-500" style={{ fontSize: '24px' }} />
                </div>
                <div className="stat-desc">21% more than last month</div>
                <div className="stat-title">Like-to-Dislike Ratio</div>
                <div className="stat-value text-primary text-success">{totalPosts > 0 ? (likes / dislikes).toFixed(2) : 0}</div>
                <div className="stat-title">Total Engagement</div>
                <div className="stat-value text-primary text-success">{likes + dislikes}</div>
              </div>
            </div>
          </div>

          {/* BarChart for Total Likes and Dislikes */}
          {reactionsWithDates && reactionsWithDates.length > 0 && (
            <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 w-auto md:w-1/2 lg:w-1/3 mx-2 mb-4 md:mb-0">
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
            <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 w-auto md:w-1/2 lg:w-1/3 mx-2">
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

      {/* Demographics Section */}
      <div className="bg-slate-100 p-3 rounded-2xl shadow-inner shadow-slate-950 w-auto md:w-1/2 lg:w-1/3 mx-2">
        <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>
          <FontAwesomeIcon icon={faChartLine} className='text-yellow-500 mx-1' />User Demographics (Pie Chart)
        </h2>
        {isDemographicsEmpty ? (
          <div className="text-center w-full">
            <p className="text-red-500">No demographics data available.</p>
          </div>
        ) : (
          <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 h-auto shadow-md rounded-2 border">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4">
              {pieData.map((entry, index) => (
                <p key={`text-${index}`} className="text-lg">
                  {`${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ${entry.value}`}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics_report;
