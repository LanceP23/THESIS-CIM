import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { UserContext } from '../../context/userContext';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import toast from 'react-hot-toast'; // Import toast
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercent, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

const COLORS = ['#E38627', '#C13C37', '#6A2135', '#42A5F5', '#66BB6A'];

const AnalyticsReport = () => {
  const { user } = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [demographicsData, setDemographicsData] = useState(null);
  const [dateFilter, setDateFilter] = useState('monthly');
  const [selectedMonth1, setSelectedMonth1] = useState('');
  const [selectedMonth2, setSelectedMonth2] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
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
        const [analyticsResponse, demographicsResponse] = await Promise.all([
          axios.get(`/count-reactions-date/${user.id}`),
          axios.get(`/user/${user.id}/demographics`)
        ]);
        setAnalyticsData(analyticsResponse.data);
        setDemographicsData(demographicsResponse.data.educationLevelCounters);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const generateAnalysis = async () => {
    setLoading(true);
  
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyD-iL9rGmRvrfU1-7oALDKJ78bmq2wOKJg');
      const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analyze user engagement data:
  
                * Total Likes: ${totalLikes}
                * Total Dislikes: ${totalDislikes}
                * Average Likes per Post: ${avgLikesPerPost}
                * Average Dislikes per Post: ${avgDislikesPerPost}
                * Like/Dislike Ratio: ${likeDislikeRatio}
  
                * Demographic Data: ${pieData.map(data => `${data.name}: ${data.value}`).join(', ')}
  
                Provide a concise analysis of user engagement and sentiment.`
              }
            ],
            role: 'user'  
          }
        ],
      
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH', // wag moko murahin boss kupal kaba
            threshold: 'BLOCK_LOW_AND_ABOVE', 
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', // wag kang bastos pare
            threshold: 'BLOCK_MEDIUM_AND_ABOVE', 
          }
        ],
        // config
        generationConfig: {
          stopSequences: ['###'], 
          maxOutputTokens: 500, 
          temperature: 0.7,
          topP: 0.9, 
          topK: 40 
        }
      };
  
      console.log('Request Body:', requestBody);
  
      const response = await model.generateContentStream(requestBody);
    
      let analysisText = '';
      for await (const chunk of response.stream) {
        analysisText += chunk.text(); 
      }
  
     
      const cleanedText = analysisText
        .replace(/^\s*#*\s*/gm, '') 
        .replace(/\*\*(.*?)\*\*/g, '$1') 
        .replace(/\*(.*?)\*/g, '$1') 
        .replace(/^\s*[-*]\s*/gm, ''); 
  
      setAnalysis(cleanedText || 'No analysis text available.');
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate analysis.');
      setAnalysis('Failed to generate analysis.');
    } finally {
      setLoading(false);
    }
  };
  
  



  if (!analyticsData || !demographicsData) {
    return <div>Loading...</div>;
  }

  const { formattedData } = analyticsData;
  const totalPosts = formattedData.length;
  const totalLikes = formattedData.reduce((sum, data) => sum + data.likes, 0);
  const totalDislikes = formattedData.reduce((sum, data) => sum + data.dislikes, 0);

  const avgLikesPerPost = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
  const avgDislikesPerPost = totalPosts > 0 ? Math.round(totalDislikes / totalPosts) : 0;
  const likeDislikeRatio = totalDislikes > 0 ? (totalLikes / totalDislikes).toFixed(2) : totalLikes;

  const filteredReactionsWithDates = formattedData.filter(reaction => {
    const date = parseISO(reaction.date);
    switch (dateFilter) {
      case 'weekly':
        return isWithinInterval(date, { start: startOfWeek(new Date()), end: endOfWeek(new Date()) });
      case 'monthly':
        return isWithinInterval(date, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
      case 'yearly':
        return isWithinInterval(date, { start: startOfYear(new Date()), end: endOfYear(new Date()) });
      case 'custom':
        if (!selectedMonth1 || !selectedMonth2) return true; 
        const startDate1 = startOfMonth(new Date(new Date().getFullYear(), parseInt(selectedMonth1), 1));
        const endDate1 = endOfMonth(new Date(new Date().getFullYear(), parseInt(selectedMonth1), 1));
        const startDate2 = startOfMonth(new Date(new Date().getFullYear(), parseInt(selectedMonth2), 1));
        const endDate2 = endOfMonth(new Date(new Date().getFullYear(), parseInt(selectedMonth2), 1));
        return isWithinInterval(date, { start: startDate1, end: endDate1 }) || isWithinInterval(date, { start: startDate2, end: endDate2 });
      default:
        return true;
    }
  });

  const reactionsByDate = filteredReactionsWithDates.reduce((acc, reaction) => {
    const date = format(parseISO(reaction.date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = { date, likes: 0, dislikes: 0 };
    acc[date].likes += reaction.likes;
    acc[date].dislikes += reaction.dislikes;
    return acc;
  }, {});
  const aggregatedReactions = Object.values(reactionsByDate);

  const isDemographicsEmpty = Object.values(demographicsData).every(count => count === 0);
  const totalDemographics = Object.values(demographicsData).reduce((sum, value) => sum + value, 0);
  const pieData = Object.entries(demographicsData)
    .filter(([key, value]) => value > 0)
    .map(([key, value], index) => ({
      name: key,
      value,
      color: COLORS[index % COLORS.length],
    }));

  // Custom Label for Pie Chart
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
    const radius = outerRadius - 10;
    const x = cx + radius * Math.cos((midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((midAngle * Math.PI) / 180);

    return (
      <text x={x} y={y} fill="#000000" textAnchor="middle" dominantBaseline="central">
        {name} ({value})
      </text>
    );
  };

  return (
    <div className="my-16">

      <div className="p-3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100  hover:shadow-2xl border-2 animate-fade-in">
  
      <h1 className="text-4xl font-bold mb-4 pb-2 border-b-2 border-yellow-500 text-left text-green-800">Online User Engagement Analytics Dashboard</h1>
      <p className="text-gray-600 mb-4">This dashboard provides insights into user reactions and demographics.</p>

      <div className=" flex flex-row ">

      <div className=" mb-10 ">
        <label htmlFor="dateFilter" className="block text-gray-700 text-lg mb-2 text-left">Select Date to Filter:</label>
        <select
          id="dateFilter"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            if (e.target.value !== 'custom') {
              setSelectedMonth1('');
              setSelectedMonth2('');
            }
          }}
          className="flex flex-row justify-items-center mt-1 mr-2 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
          <option value="custom">Compare Months</option>
        </select>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex flex-row ">
          <div className="flex flex-col">
          <label htmlFor="monthFilter1" className="  text-gray-700 text-lg text-left ">Select First Month:</label>
          <select
            id="monthFilter1"
            value={selectedMonth1}
            onChange={(e) => setSelectedMonth1(e.target.value)}
            className="flex flex-row justify-items-center mt-1 mr-2 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md"
          >
            <option value="">Select a Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{format(new Date(0, i), 'MMMM')}</option>
            ))}
          </select>

          </div>

          <div className="flex flex-col">
          <label htmlFor="monthFilter2" className=" text-gray-700 text-lg text-left ">Select Second Month:</label>
          <select
            id="monthFilter2"
            value={selectedMonth2}
            onChange={(e) => setSelectedMonth2(e.target.value)}
            className="flex flex-row justify-items-center mt-1  py-2 px-3 border border-green-300 bg-white rounded-md shadow-md"
          >
            <option value="">Select a Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{format(new Date(0, i), 'MMMM')}</option>
            ))}
          </select>
          </div>
        </div>
      )}

      </div>

      {/* General Overview Section */}
      <div className=" grid grid-rows-2  ">
        <div className=" grid grid-cols-2 gap-3 mb-2 ">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold text-green-800">Total Likes  <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" style={{ fontSize: '24px' }} /></h3>
          <p className="text-2xl text-green-600">{totalLikes}</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold text-red-800">Total Dislikes <FontAwesomeIcon icon={faThumbsDown} className="text-red-800" style={{ fontSize: '24px' }} /></h3>
          <p className="text-2xl text-red-600">{totalDislikes}</p>
        </div>

        </div>

        <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800">Average Likes per Post <FontAwesomeIcon icon={faThumbsUp} className="text-blue-800" style={{ fontSize: '24px' }} /></h3>
          <p className="text-2xl text-blue-600">{avgLikesPerPost}</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800">Average Dislikes per Post <FontAwesomeIcon icon={faThumbsDown} className="text-blue-800" style={{ fontSize: '24px' }} /></h3>
          <p className="text-2xl text-blue-600">{avgDislikesPerPost}</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold text-purple-800">Like/Dislike Ratio <FontAwesomeIcon icon={faPercent} className="text-purple-800" style={{ fontSize: '24px' }} /></h3>
          <p className="text-2xl text-purple-600">{likeDislikeRatio}</p>
        </div>
        </div>
      </div>

      </div>

      <div className="p-3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100  hover:shadow-2xl border-2 animate-fade-in">

     

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b-2 border-yellow-500">Reactions by Date</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aggregatedReactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="likes" stroke="#8884d8" />
              <Line type="monotone" dataKey="dislikes" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b-2 border-yellow-500">Reactions Count by Date</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregatedReactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="likes" fill="#8884d8" />
              <Bar dataKey="dislikes" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Generate Analysis Button */}
       <div className="mb-6">
        <button
          onClick={generateAnalysis}
          disabled={loading}
          className="btn btn-success"
        >
          {loading ? (<span className="loading loading-spinner loading-xs"></span>):( 'Generate An Analysis')}
        </button>
      </div>

      {/* Interpretation Section */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-500 text-green-800">Analysis</h2>
        {loading ? (
    <div className="flex w-52 flex-col gap-4">
    <span className="loading loading-dots loading-lg"></span>
    <div className="skeleton h-4 w-28"></div>
    <div className="skeleton h-4 w-full"></div>
    <div className="skeleton h-4 w-full"></div>
  </div>
  ) : (
    <div className=' text-justify font-bold' dangerouslySetInnerHTML={{ __html: analysis }} />
  )}
      </div>

      </div>

      <div className="p-3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100  hover:shadow-2xl border-2 animate-fade-in">

      {/* Demographics Pie Chart */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-500 text-green-800">User Demographics</h2>
        {isDemographicsEmpty ? (
          <p>No demographic data available.</p>
        ) : (
          <div className="p-4 bg-white shadow-lg rounded-lg">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  labelLine={false}
                  label={CustomLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Tooltip />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      </div>
    </div>
  );
};

export default AnalyticsReport;

