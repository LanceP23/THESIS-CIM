import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Brush, Legend } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { UserContext } from '../../context/userContext';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import toast from 'react-hot-toast'; // Import toast
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercent, faThumbsDown, faThumbsUp, faDownload } from '@fortawesome/free-solid-svg-icons';
import {saveAs} from 'file-saver';
import Modal from 'react-modal';
import MinigameAnalytics from './MinigameAnalytics';
import CombineAnalytics from './CombinedAnalytics';

const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
  "#FF9F40", "#C9CBCF", "#FF6384", "#36A2EB", "#FFCE56",
];
const colors2 = [
  '#FF5733', // Red-Orange
  '#33FF57', // Green
  '#3357FF', // Blue
  '#FF33A1', // Magenta
  '#FF8C00', // Dark Orange
  '#8B00FF', // Purple
  '#00BFFF', // Deep Sky Blue
  '#FFD700', // Gold
  '#FF1493', // Deep Pink
  '#00FF7F', // Spring Green
  '#D2691E', // Chocolate
  '#A52A2A', // Brown
  '#B22222', // Firebrick
  '#4682B4', // Steel Blue
  '#32CD32'  // Lime Green
];
const AnalyticsReport = () => {
  const { user } = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [demographicsData, setDemographicsData] = useState(null);
  const [dateFilter, setDateFilter] = useState('monthly');
  const [selectedMonth1, setSelectedMonth1] = useState('');
  const [selectedMonth2, setSelectedMonth2] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [commentsData, setCommentsData] = useState([]);
  const [commentAnalysis, setCommentAnalysis] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [activeTab, setActiveTab] = useState('engagement');
  const [totalMiniGamesPlayed, setTotalMiniGamesPlayed] = useState(null);
  const [totalMiniGameWins, setTotalMiniGameWins] = useState(null);
  const [averageScore, setAverageScor] = useState(null);
  const [selectedDateAnnouncements, setSelectedDateAnnouncements] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("both");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/check-auth');
        if (!response.data.authenticated) {
          navigate('/login');
          window.location.reload();
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
        setDemographicsData(demographicsResponse.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };
  
    if (user) {
      fetchData(); // Fetch initially
      const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
  
      return () => clearInterval(interval); 
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
                text: `Analyze the following user engagement data and provide a response in bullet points format:
                * Total Likes: ${totalLikes}
                * Total Dislikes: ${totalDislikes}
                * Average Likes per Post: ${avgLikesPerPost}
                * Average Dislikes per Post: ${avgDislikesPerPost}
                * Like/Dislike Ratio: ${likeDislikeRatio}
  
                * Demographic Data: ${pieData.map(data => `${data.name}: ${data.value}`).join(', ')}
  
                Provide a detailed analysis of user engagement and sentiment. Use the following structure:

                * **Analysis:**
                    - Highlight key points regarding user engagement metrics like likes, dislikes, and the like/dislike ratio.
                    - Include observations about the demographic data and its implications on engagement.
                
                * **Suggestions:**
                    1. Enumerate actionable recommendations based on the analysis.
                    2. Keep each suggestion concise and clearly numbered.
                    3. Focus on improving user engagement and targeting specific demographics.` 

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
    return <div className='p-3 mt-16 mx-14  hover:shadow-2xl  animate-fade-in bg-slate-200 rounded-xl '
    > 
      <span className="loading loading-bars loading-xs"></span>
    <span className="loading loading-bars loading-sm"></span>
    <span className="loading loading-bars loading-md"></span>
    <span className="loading loading-bars loading-lg"></span></div>;
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
    
    // Initialize the date entry if it doesn't exist
    if (!acc[date]) {
        acc[date] = {
            date,
            likes: 0,
            dislikes: 0,
            announcements: []  // Initialize announcements array for this date
        };
    }
    
    // Accumulate likes and dislikes
    acc[date].likes += reaction.likes;
    acc[date].dislikes += reaction.dislikes;

    // Ensure announcements is an array and push current announcement
    if (Array.isArray(reaction.announcements)) {
        acc[date].announcements.push(...reaction.announcements);
    }

    return acc;
}, {});

// Convert the accumulated reactionsByDate object to an array
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

  const CustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="#000" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${name} (${value})`}
      </text>
    );
  };
  
  

const fetchCommentsData = async () => {
  try {
    const response = await axios.get(`/comments/${user.id}`);
    setCommentsData(response.data.comments);
  } catch (error) {
    console.error('Error fetching comments data:', error);
  }
};



const exportData = () => {
  const formatCsvField = (field) => {
      if (typeof field === 'string') {
          // Normalize text to remove control characters only
          field = field.normalize("NFC").replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

          // Replace any double quotes with double double-quotes
          field = field.replace(/"/g, '""');

          // Wrap field in double quotes if it contains commas, newlines, or double quotes
          if (field.includes(',') || field.includes('\n') || field.includes('"')) {
              return `"${field}"`;
          }
      }
      return field;
  };

  const likesDislikesCsvRows = [];
  const likesDislikesHeaders = [
      'Date', 'Announcement ID', 'Content Type', 'Poster ID', 'Likes', 'Dislikes'
  ];
  likesDislikesCsvRows.push(likesDislikesHeaders.join(','));

  if (aggregatedReactions && Array.isArray(aggregatedReactions)) {
      aggregatedReactions.forEach(reaction => {
          const { date, likes, dislikes, announcements } = reaction;
          if (announcements && Array.isArray(announcements)) {
              announcements.forEach(announcement => {
                  const row = [
                      formatCsvField(date || ''),
                      formatCsvField(announcement.body || ''),
                      formatCsvField(announcement.contentType || ''),
                      formatCsvField(announcement.posterId || ''),
                      formatCsvField(announcement.likes || ''),
                      formatCsvField(announcement.dislikes || ''),
                  ];
                  likesDislikesCsvRows.push(row.join(','));
              });
          }
      });
  }

  // Add BOM to the beginning of the CSV string
  const BOM = '\uFEFF';
  const likesDislikesCsvString = BOM + likesDislikesCsvRows.join('\n');
  const likesDislikesBlob = new Blob([likesDislikesCsvString], { type: 'text/csv;charset=utf-8;' });
  saveAs(likesDislikesBlob, 'likes_dislikes_data.csv');

  const demographicsCsvRows = [];
  const demographicsHeaders = ['Grade School', 'High School', 'Senior High School', 'College', 'Admin'];
  demographicsCsvRows.push(demographicsHeaders.join(','));

  const demographicsRow = [
      demographicsData.gradeSchool || 0,
      demographicsData.highSchool || 0,
      demographicsData.seniorHighSchool || 0,
      demographicsData.college || 0,
      demographicsData.admin || 0
  ];
  demographicsCsvRows.push(demographicsRow.join(','));

  const demographicsCsvString = BOM + demographicsCsvRows.join('\n');
  const demographicsBlob = new Blob([demographicsCsvString], { type: 'text/csv;charset=utf-8;' });
  saveAs(demographicsBlob, 'demographics_data.csv');
};



const handleDateClick = async (date) => {
  // Find the data for the selected date
  const dateData = aggregatedReactions.find((entry) => entry.date === date);

  if (dateData) {
    // Sort announcements by likes in descending order
    const topAnnouncements = [...dateData.announcements]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10); // Get the top 3 announcements

    try {
      // Fetch demographics for each top announcement
      const announcementsWithDemographics = await Promise.all(
        topAnnouncements.map(async (announcement) => {
          const response = await axios.get(`/announcements/${announcement.announcementId}/demographics`);
          return {
            ...announcement,
            demographics: response.data, // Attach demographics to the announcement
          };
        })
      );

      // Set the state for selectedDateAnnouncements (for listing purposes)
      setSelectedDateAnnouncements(announcementsWithDemographics);
    } catch (error) {
      console.error('Error fetching demographics:', error);
    }
  }
};

const handleViewDemographicsClick = (announcement) => {
  // Set the selected announcement to open the modal
  setSelectedAnnouncement(announcement);
};





const engagementByContentType = {};

// Loop through each entry in aggregatedReactions
aggregatedReactions.forEach(reaction => {
  reaction.announcements.forEach(announcement => {
    const contentType = announcement.contentType || 'text'; // Default to 'text'
    const likes = announcement.likes || 0;
    const dislikes = announcement.dislikes || 0;

    // Initialize content type category if it doesn't exist
    if (!engagementByContentType[contentType]) {
      engagementByContentType[contentType] = { likes: 0, dislikes: 0 };
    }

    // Aggregate likes and dislikes
    engagementByContentType[contentType].likes += likes;
    engagementByContentType[contentType].dislikes += dislikes;
  });
});

// Generate data for the pie chart based on the selected filter
const filteredData = Object.keys(engagementByContentType).map((contentType, index) => {
  const { likes, dislikes } = engagementByContentType[contentType];
  const value =
    filter === "likes"
      ? likes
      : filter === "dislikes"
      ? dislikes
      : likes + dislikes; // Default to both

  return {
    name: contentType,
    value,
    fill: colors2[index % colors2.length], // Assign color dynamically
  };
});

const educationLevelData = Object.entries(demographicsData.educationLevelCounters).map(
  ([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  })
);

// Function to open modal and prepare breakdown data
const handlePieClick = (data) => {
  if (data && demographicsData.sectionYearLevelCounters) {
    // Map the displayed name to abbreviations used in sectionYearLevelCounters
    const educationLevelAbbreviations = {
      "gradeSchool": "GS",
      "highSchool": "HS",
      "seniorHighSchool": "SHS",
      "college": "College",
    };

    // Get the abbreviation corresponding to the clicked section
    const targetAbbreviation = educationLevelAbbreviations[data.name] || "";

    // Filter sections that match the target abbreviation
    const sections = Object.entries(demographicsData.sectionYearLevelCounters).filter(([key]) => {
      return key.includes(targetAbbreviation);
    });

    // Prepare data for breakdown
    const breakdownData = sections.map(([section, count], index) => ({
      name: section,
      value: count,
      color: COLORS[index % COLORS.length],
    }));

    setSelectedData(breakdownData);
    setSelectedLevel(data.name);
    setIsModalOpen(true);
  }
};

const getPieChartData = (sectionYearLevelCounters) => {
  return Object.keys(sectionYearLevelCounters).map((key, index) => ({
    name: key,
    value: sectionYearLevelCounters[key],
    color: colors2[index % colors2.length], // Use colors cyclically
  }));
};

const visibleAnnouncements = selectedDateAnnouncements.slice(currentIndex, currentIndex + 3);

const handleNext = () => {
  // Check if we are at the end of the list, if so, reset to 0
  if (currentIndex + 3 < selectedDateAnnouncements.length) {
    setCurrentIndex(currentIndex + 3);
  }
};

const handlePrev = () => {
  // Go back by 3 items
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 3);
  }
};




  return (
  <div className="mt-16 ml-8 p-1">
    <div className="p-3 m-3 w-auto h-full shadow-md rounded-3 bg-slate-100 hover:shadow-2xl border-2 animate-fade-in">
      
  
      <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-bold mb-4 pb-2 border-b-2 border-yellow-500 text-left text-green-800">
        Online User Engagement Analytics Dashboard
      </h1>
      {activeTab === 'engagement' && (
        <p className="text-gray-600 mb-4">This dashboard provides insights into user reactions and demographics.</p>


      )}
      
      
      {/* Tab Navigation */}
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'engagement' ? 'border-b-2 border-green-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('engagement')}
        >
          User Engagement
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'minigame' ? 'border-b-2 border-green-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('minigame')}
        >
          Minigame Analytics
        </button>
      

      </div>

      {/* User Engagement Tab Content */}
      {activeTab === 'engagement' && (
        <div>
          <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row xl:flex-row ">
            <div className="mb-10">
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
              <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row xl:flex-row mb-2">
                <div className="flex flex-col">
                  <label htmlFor="monthFilter1" className="text-gray-700 text-lg text-left">Select First Month:</label>
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
                  <label htmlFor="monthFilter2" className="text-gray-700 text-lg text-left">Select Second Month:</label>
                  <select
                    id="monthFilter2"
                    value={selectedMonth2}
                    onChange={(e) => setSelectedMonth2(e.target.value)}
                    className="flex flex-row justify-items-center mt-1 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md"
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
          <div className="grid grid-rows-1">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 mb-2">
              <div className="p-4 bg-white shadow-lg rounded-lg">
                <h3 className="text-xl font-semibold text-green-800">Total Likes <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" style={{ fontSize: '24px' }} /></h3>
                <p className="text-2xl text-green-600">{totalLikes}</p>
              </div>
              <div className="p-4 bg-white shadow-lg rounded-lg">
                <h3 className="text-xl font-semibold text-red-800">Total Dislikes <FontAwesomeIcon icon={faThumbsDown} className="text-red-800" style={{ fontSize: '24px' }} /></h3>
                <p className="text-2xl text-red-600">{totalDislikes}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3">
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

            <div className="flex flex-row justify-end mt-4 " >

              <div className="lg:tooltip" data-tip="Download Like/Dislike data">
                <button
                  onClick={exportData}
                  className="bg-green-500 text-white hover:bg-green-600 flex items-center px-4 py-2 rounded"
                  aria-label="Download Data"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Download
                </button>
              </div>
           </div>

          
          </div>

          <div className="grid grid-rows-1 md:grid-cols-2 gap-6 mb-6 mt-6">
  {/* Reactions by Date and Reactions by Content Type in the left column */}
  <div className="p-4 bg-white shadow-lg rounded-lg">
    {/* Reactions by Date (Line Chart) */}
    <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b-2 border-yellow-500">
      Reactions by Date
    </h2>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={aggregatedReactions}
        onClick={(e) => {
          if (e && e.activeLabel) {
            handleDateClick(e.activeLabel);
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line type="monotone" dataKey="likes" stroke="#8884d8" />
        <Line type="monotone" dataKey="dislikes" stroke="#ff7300" />

        <Brush />
      </LineChart>
    </ResponsiveContainer>

   
  </div>

   {/* Reactions by Content Type (Pie Chart) */}
  <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b-2 border-yellow-500">
        Reactions by Content Type
      </h2>
      
      {/* Buttons to toggle filter */}
      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={() => setFilter("both")}
          className={`px-4 py-2 rounded ${filter === "both" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          Both
        </button>
        <button
          onClick={() => setFilter("likes")}
          className={`px-4 py-2 rounded ${filter === "likes" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Likes
        </button>
        <button
          onClick={() => setFilter("dislikes")}
          className={`px-4 py-2 rounded ${filter === "dislikes" ? "bg-red-500 text-white" : "bg-gray-200"}`}
        >
          Dislikes
        </button>
      </div>

      {/* Render Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {/* Assign a unique color to each pie slice */}
            {filteredData.map((entry, index) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>


  {/* Top 3 Announcements in the right column */}
  <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden">
      <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b-2 border-yellow-500">
       Most Liked Posts
      </h2>
        <div className="flex transition-transform duration-500 ease-in-out">
          {visibleAnnouncements.map((announcement) => (
            <div
              key={announcement.announcementId}
              className="w-full sm:w-64 mx-auto p-6 border border-gray-200 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
            >
              <h4 className="text-lg font-semibold text-gray-800 truncate">{announcement.header}</h4>
              <p className="mt-2 text-sm text-gray-600 truncate">{announcement.body}</p>

              {announcement.mediaUrl && (
                <img
                  src={announcement.mediaUrl}
                  alt={announcement.header}
                  className="w-full h-48 object-cover mt-4 rounded-lg"
                />
              )}

              <p className="mt-4 text-sm text-gray-500">
                Likes: {announcement.likes} | Dislikes: {announcement.dislikes}
              </p>

              {/* Button to open the demographics modal */}
              <button
                className="mt-4 text-blue-600 hover:underline"
                onClick={() => handleViewDemographicsClick(announcement)} // Open modal for the clicked announcement
              >
                View Demographics
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white bg-blue-500 p-2 rounded-full hover:bg-blue-700 focus:outline-none"
        onClick={handlePrev}
        disabled={currentIndex === 0} // Disable the Prev button when we're at the start
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white bg-blue-500 p-2 rounded-full hover:bg-blue-700 focus:outline-none"
        onClick={handleNext}
        disabled={currentIndex + 3 >= selectedDateAnnouncements.length} // Disable the Next button when we're at the end
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>



{/* Demographics Modal */}
{/* Demographics Modal */}
{selectedAnnouncement && (
  <Modal
    isOpen={true}
    onRequestClose={() => setSelectedAnnouncement(null)} // Close the modal
    contentLabel={`Demographics for "${selectedAnnouncement.header}"`}
    style={{
      content: {
        width: "60%",
        maxHeight: "80vh",
        margin: "auto",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "auto",
      },
      overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
    }}
  >
    <h2 className="text-xl font-bold mb-4 text-center border-b-2 border-yellow-500 pb-2 text-green-900">
      {`Demographics for "${selectedAnnouncement.header}"`}
    </h2>

    {/* Pie Chart */}
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={getPieChartData(selectedAnnouncement.demographics.sectionYearLevelCounters)} // Get data for the pie chart
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={(entry) => `${entry.name}: ${entry.value}`}
          labelLine={false}
        >
          {getPieChartData(selectedAnnouncement.demographics.sectionYearLevelCounters).map((entry, index) => (
            <Cell key={`modal-cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>

    {/* Legend Inside Modal */}
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-2 text-center border-b border-yellow-500 text-green-900">Legend</h4>
      <ul className="flex flex-wrap gap-4 justify-center">
        {getPieChartData(selectedAnnouncement.demographics.sectionYearLevelCounters).map((entry, index) => (
          <li key={`modal-legend-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm">{entry.name}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Close Button */}
    <div className="text-center mt-6">
      <button
        onClick={() => setSelectedAnnouncement(null)} // Close the modal
        className="btn btn-circle btn-sm absolute top-2 right-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </Modal>
)}




</div>

          
          

          {/* Interpretation Section */}
          <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-500 text-green-800">Automated Analysis</h2>

          
            <div className="analysis-result mt-6 p-4 bg-gray-100 rounded-lg">
      {analysis.split('\n').map((line, index) => (
        <p key={index} className="text-lg text-gray-700 text-justify mb-2">
          {/* Check for bullet points or enumerated list patterns and render appropriately */}
          {line.startsWith('-') || line.match(/^\d+\./) ? (
            <li className="list-disc ml-6">{line}</li>
          ) : (
            <span>{line}</span>
          )}
        </p>
      ))}
    </div>
              {/* Generate Analysis Button */}
          <div className="mb-6 text-end my-2">
            <button
              onClick={generateAnalysis}
              disabled={loading}
              className="btn btn-success "
            >
              {loading ? (<span className="loading loading-spinner loading-xs"></span>):( 'Generate An Analysis')}
            </button>
          </div>

          </div>

          <div className="">
        {/* Demographics Pie Chart */}
        <div className="mb-6">
      
        {isDemographicsEmpty ? (
              <p className="text-gray-500 text-center font-medium text-lg mt-5">
                No demographic data available.
              </p>
            ) : (
              
                <div className=" w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-1">

            {/* Left side: Demographic Breakdown */}
            <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col text-left text-lg text-gray-700">
              <h3 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-500 text-green-800">
                User Demographic
              </h3>
              {Object.keys(demographicsData.educationLevelCounters).length > 0 ? (
                <ul>
                  {Object.entries(demographicsData.educationLevelCounters).map(([key, value], index) => (
                    <li key={`label-${index}`} className="mb-2 flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium">{key}</span>: {value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No demographic data available.</p>
              )}
            </div>


              {/* Right side: Pie Chart */}
              <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col text-left">
              <h5 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-500 text-green-800">
                User Demographic Chart
              </h5>
              <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            data={educationLevelData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => `${entry.name}: ${entry.value}`}
            labelLine={false}
            onClick={handlePieClick} // Handle clicks
          >
            {educationLevelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#2D3748",
              color: "#fff",
              borderRadius: "5px",
              padding: "8px",
            }}
            itemStyle={{ color: "#EDF2F7" }}
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
{/* Modal for Selected Level Breakdown */}
<Modal
  isOpen={isModalOpen}
  onRequestClose={() => setIsModalOpen(false)}
  contentLabel={`${selectedLevel} Breakdown`}
  style={{
    content: {
      width: "60%",
      maxHeight: "80vh",
      margin: "auto",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      overflow: "auto",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  }}
>
  <h2 className="text-xl font-bold mb-4 text-center border-b-2 border-yellow-500 pb-2 text-green-900">
    {`${selectedLevel} Breakdown`}
  </h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={selectedData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={120}
        label={(entry) => `${entry.name}: ${entry.value}`}
        labelLine={false}
      >
        {selectedData?.map((entry, index) => (
          <Cell key={`modal-cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>

  {/* Legend Inside Modal */}
  <div className="mt-6">
    <h4 className="text-lg font-semibold mb-2 text-center border-b border-yellow-500 text-green-900">Legend</h4>
    <ul className="flex flex-wrap gap-4 justify-center">
      {selectedData?.map((entry, index) => (
        <li key={`modal-legend-${index}`} className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm">{entry.name}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Close Button */}
  <div className="text-center mt-6">
    <button
      onClick={() => setIsModalOpen(false)}
      className="btn btn-circle btn-sm absolute top-2 right-2"
    >
       <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
    </button>
  </div>
</Modal>

              </div>
            </div>
          
        )}

        </div>
         </div>
        </div>

        
      )}


      {/* Mini Game Analytics Tab Content */}
      {activeTab === 'minigame' && (
        <div>
          <MinigameAnalytics/>
          </div>
      )}

{activeTab === 'combined' && (
        <div>
          <CombineAnalytics/>
          </div>
      )}
      
     
    </div>
  </div>
);

};
export default AnalyticsReport;