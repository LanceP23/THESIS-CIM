import React, { useEffect, useState } from 'react';  
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './MinigameAnalytics.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faAward, faGamepad, faShop} from '@fortawesome/free-solid-svg-icons';
import MinigameShop from './MinigameShop';
import { useNavigate } from 'react-router-dom';


const MinigameAnalytics = () => {
  const [winRate, setWinRate] = useState(null);
  const [averageGuesses, setAverageGuesses] = useState(null);
  const [activePlayers, setActivePlayers] = useState([]);
  const [guessDistribution, setGuessDistribution] = useState([]);
  const [winStreaks, setWinStreaks] = useState([]);
  const [averageTries, setAverageTries] = useState(null);
  const [tryDistribution, setTryDistribution] = useState([]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); 

  // Fetch Analytics Data
  const fetchAnalytics = async () => {
    try {
      const winRateRes = await axios.get('/win-rate');
      setWinRate(winRateRes.data);

      const avgGuessesRes = await axios.get('/average-guesses');
      setAverageGuesses(avgGuessesRes.data);

      const activePlayersRes = await axios.get('/active-players');
      setActivePlayers(activePlayersRes.data.activePlayers);

      const guessDistributionRes = await axios.get('/guess-distribution');
      setGuessDistribution(guessDistributionRes.data.guessDistribution);

      const winStreaksRes = await axios.get('/win-streaks');
      setWinStreaks(winStreaksRes.data.streaks);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchFlappyCIMStats = async () => {
    try {
      const avgTriesRes = await axios.get('/average-tries');
      setAverageTries(avgTriesRes.data.averageTriesPerPlayer);
  
      const tryDistributionRes = await axios.get('/try-distribution');
      setTryDistribution(tryDistributionRes.data.tryDistribution);
    } catch (err) {
      console.error('Error fetching Flappy CIM stats:', err);
    }
  };
  

  const fetchLeaderboard = async () => {
    try {
      const leaderboardRes = await axios.get('/leaderboard');
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // Generate analysis
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
                text: `Analyze the following minigame data and provide a response in bullet points format:
                
                * Win Rate: ${winRate.winRate}% 
                * Average Guesses for Wins: ${averageGuesses.averageGuesses}
                * Active Players: ${activePlayers.length}
                * Win Streaks: ${winStreaks.map(streaks => `Player ${streaks.userName}: ${streaks.maxStreak}`).join(', ')}
                * Guess Distribution: ${guessDistribution.map(g => `${g._id} guesses: ${g.count}`).join(', ')}
                *Average Tries (Flappy CIM):** ${averageTries.averageTries} player: ${averageTries.userName}  
                * ${formatTryDistributionForPrompt(tryDistribution).join('\n      ')} try distribution is for flappy cim guess is for cim wordle
                * Create a seperate analysis for both games win rate is for all games average guesses is for CIM Wordle, Active player is for all games,  win streaks is for both games, guess distribution is for CIM Wordle. The rest is flappy cim.
                
                 Provide an analysis of player performance and engagement using the following structure:
                
                * **Analysis:**
                    - Key points separated by space for clarity.

                * **Suggestions:**
                    1. Provide concise, actionable points for improvement.
                    2. Enumerate each suggestion clearly.`
              }
            ],
            role: 'user'
          }
        ],
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
        generationConfig: {
          stopSequences: ['###'],
          maxOutputTokens: 600,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        }
      };

      const response = await model.generateContentStream(requestBody);
      let analysisText = '';
      for await (const chunk of response.stream) {
        analysisText += chunk.text();
      }

      const cleanedText = analysisText
        .replace(/^\s*#*\s*/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')

      setAnalysis(cleanedText || 'No analysis text available.');
    } catch (error) {
      console.error('Error generating analysis:', error);
      setAnalysis('Failed to generate analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchLeaderboard();
    fetchFlappyCIMStats();
  }, []);

  const winRateData = [
    { name: 'Wins', value: winRate?.wins || 0 },
    { name: 'Losses', value: (winRate?.totalGames - winRate?.wins) || 0 }
  ];

  const guessDistributionData = guessDistribution.map(g => ({
    name: `${g._id} guesses`,
    value: g.count
  }));

  const winStreakData = winStreaks.map(streak => ({
    userName: streak.userName,  // Name of the player
    value: streak.maxStreak     // Max streak value
  }));
  

  const tryDistributionData = Array.isArray(tryDistribution)
  ? tryDistribution.flatMap(item => 
      item.userNames.map(userName => ({
        name: userName,  // Use userName for the player's name
        value: item.totalPlayers  // Assuming you want to display the totalPlayers for each user
      }))
    )
  : [];

  const formatTryDistributionForPrompt = (tryDistribution) => {
    return Array.isArray(tryDistribution)
      ? tryDistribution.map(
          item =>
            `${item.totalPlayers} players attempted ${item._id} tries (${item.userNames.join(', ')})`
        )
      : [];
  };
  

  const averageTriesData = Array.isArray(averageTries)
  ? averageTries.map(item => ({
      name: item.userName,  // Player's name
      value: item.averageTries  // Average tries per player
  }))
  : [];

  const handleLoadMore = () => {
    setVisibleCount(visibleCount + 5); 
  };


  return (
    <div className=" border  p-4 rounded-lg " >
     <div className="flex flex-row bg-gradient-to-r from-black to-green-800 rounded-md relative mb-4">
  <div className="div">
    <img 
      src="/assets/CORPO_CIM/CIMdle_LOGO.png" 
      alt="CIMdle Logo" 
      className="h-[35vh] w-full opacity-50" 
    />
  </div>
  <div className="div">
    <img 
      src="/assets/CORPO_CIM/FLAPPY-CAT-LOGO.png" 
      alt="CIMdle Logo" 
      className="h-[36vh] w-full opacity-50 mx-2" 
    />
  </div>
  <div className="absolute bottom-4 right-4">
    <button
      onClick={() => navigate('/minigame-shop')}
      className="group relative flex items-center bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none"
    >
      {/* FontAwesome Shop Icon */}
      <FontAwesomeIcon icon={faShop} className="text-white text-xl mr-2" />
      {/* Button text */}
      <span className=" text-sm text-white">Visit Shop Inventory</span>
    </button>
  </div>
</div>


   

      {/* Analytics Section */}
      <div className="charts-section grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {/* Win Rate Chart */}
        {winRate && (
          <div className="chart-container p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Win Rate(All games)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={winRateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  <Cell key="win" fill="#36a2eb" />
                  <Cell key="loss" fill="#ff6384" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Guess Distribution Chart */}
        <div className="chart-container p-4 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Guess Distribution(CIM Wordle)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={guessDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4bc0c0" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win Streaks Chart */}
        {winStreaks.length > 0 && (
          <div className="chart-container p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Win Streaks(All games)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={winStreakData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="userName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4bc0c0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

  {/* Average Tries Chart */}
<div className="chart-container p-4 bg-white rounded-lg shadow-lg">
  <h3 className="text-xl font-semibold text-gray-700 mb-4">Average Tries (Flappy Cat)</h3>
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={averageTriesData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#ff9f40" />
    </BarChart>
  </ResponsiveContainer>
</div>


{/* Try Distribution Chart */}
<div className="chart-container p-4 bg-white rounded-lg shadow-lg">
  <h3 className="text-xl font-semibold text-gray-700 mb-4">Try Distribution (Flappy Cat)</h3>
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={tryDistributionData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={60}
        label
      >
        {tryDistributionData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={index % 2 === 0 ? "#36a2eb" : "#ff6384"}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>





      

       {/* Leaderboard Section */}
       <div className="leaderboard-section mt-6 p-4 bg-white rounded-lg shadow-lg">
      <div className="flex flex-row justify-center items-center">
        <img
          src='/assets/CORPO_CIM/CLAW_MARKS_POINTS.png'
          className='w-14 h-14'
        />
        <h3 className="text-3xl font-semibold text-green-800">
          Clawmarks Leaderboard{" "}
          <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 ml-2 text-3xl" />
        </h3>
      </div>
      <div className="divider divider-warning divider-vertical"></div>

      {leaderboard.length === 0 ? (
        <p className="text-lg text-gray-600">No leaderboard data available.</p>
      ) : (
        <div className="leaderboard-list">
          <ul className="list-none bg flex flex-col max-h-96 overflow-auto">
            {/* Map only the visible players */}
            {leaderboard.slice(0, visibleCount).map((player, index) => (
              <li
                key={index}
                className={`flex items-center p-3 mb-4 border-b ${
                  index === 0
                    ? 'bg-yellow-100 border-2 border-yellow-600 shadow-lg rounded-lg '
                    : ''
                }`}
              >
                {/* Rank and Trophy Icon */}
                <div className="flex mr-5 items-center w-1/6">
                  <span
                    className={`rank-badge ${
                      index === 0
                        ? 'font-bold text-yellow-500 text-3xl'
                        : index === 1
                        ? 'text-gray-700 font-bold text-2xl'
                        : index === 2
                        ? 'text-gray-800 font-bold text-2xl'
                        : 'text-gray-500 font-bold'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <FontAwesomeIcon
                    icon={index === 0 ? faTrophy : index === 1 ? faMedal : faAward}
                    className={`text-2xl ml-2 ${
                      index === 0
                        ? 'text-yellow-500 text-3xl'
                        : index === 1
                        ? 'text-gray-500 text-2xl'
                        : 'text-yellow-800 text-2xl'
                    }`}
                  />
                </div>

                {/* Player's name and clawmarks */}
                <div className="flex flex-col justify-around sm:flex-col md:flex-row lg:flex-row xl:flex-row sm:justify-between w-5/6">
                  <div className="flex items-center">
                    <img
                      src={
                        player.profilePicture ||
                        'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                      }
                      alt={player.name}
                      className={`w-10 h-10 rounded-full mr-4 ${
                        index === 0 ? 'ring-2 ring-yellow-500' : ''
                      }`}
                    />
                    <span
                      className={`text-lg font-semibold ${
                        index === 0 ? 'text-yellow-600' : 'text-gray-800'
                      }`}
                    >
                      {player.name}
                    </span>
                  </div>
                  <div className="flex flex-row justify-center items-center text-xl font-bold text-green-800">
                    <img
                      src='/assets/CORPO_CIM/CLAW_MARKS_POINTS.png'
                      className='w-14 h-14'
                    />{' '}
                    {player.clawMarks} clawmarks
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Load More Button */}
          {visibleCount < leaderboard.length && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLoadMore}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>

<div className="active-players-container mt-6 p-4 bg-white rounded-lg shadow-lg">
  <h3 className="text-3xl pb-2 font-semibold text-green-800 mb-4 border-b border-yellow-500">Top Active Players <FontAwesomeIcon icon={faGamepad} className="text-green-800 mr-2 text-3xl " /></h3>
  {activePlayers.length === 0 ? (
    <p className="text-lg text-gray-600">No active players found.</p>
  ) : (
    <div className="players-list grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {activePlayers.map((player, index) => {
        let playerStyle = "bg-gray-100";
        let imageSize = "w-16 h-16";
        let nameStyle = "text-xl font-semibold text-gray-800";
        let gamesPlayedStyle = "text-lg text-gray-800";

        // Top player styles
        if (index === 0) {
          playerStyle = "bg-yellow-100 border-2 border-yellow-500 scale-105 shadow-xl";
          nameStyle = "text-2xl font-bold text-gray-900";
          gamesPlayedStyle = "text-lg font-semibold text-gray-900";
        } else if (index === 1) {
          playerStyle = "bg-gray-100 border border-gray-800 scale-100";
        } else if (index === 2) {
          playerStyle = "bg-gray-100 border border-yellow-200 scale-100";
        }

        return (
          <div key={index} className={`player-card p-4 rounded-lg  ${playerStyle}`}>
            <div className="flex mb-4">
              <img
                src={player.user.profilePicture || 'https://via.placeholder.com/100'}
                alt={player.user.name}
                className={`rounded-full mr-4 ${imageSize}`}
              />
           
              <div className='flex flex-row justify-between'>
                <div className="flex flex-col text-left">
                <h4 className={nameStyle}>{player.user.name}</h4>
                <p className="text-sm text-gray-600 ">{player.user.studentemail}</p>
                <p className="text-sm text-gray-600">{player.user.section}</p>
                </div>
                <div className="flex">
                {index === 0 && ( // Conditionally render the trophy icon for the top player only
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 mr-2 text-3xl" />
              )}
                </div>

                <div className="flex">
                {index === 1 && ( // Conditionally render the trophy icon for the top player only
                <FontAwesomeIcon icon={faMedal} className="text-gray-500 mr-2 text-3xl" />
              )}
                </div>

                <div className="flex ">
                {index === 2 && ( // Conditionally render the trophy icon for the top player only
                <FontAwesomeIcon icon={faAward} className="text-yellow-800 mr-2 text-3xl " />
              )}
                </div>

                <div className="flex ">
                {index === 3 && ( // Conditionally render the trophy icon for the top player only
                <FontAwesomeIcon icon={faAward} className="text-yellow-800 mr-2 text-3xl " />
              )}
                </div>

                <div className="flex ">
                {index === 4 && ( // Conditionally render the trophy icon for the top player only
                <FontAwesomeIcon icon={faAward} className="text-yellow-800 mr-2 text-3xl " />
              )}
                </div>
              </div>
            </div>
            <div className="text-left">
              <p className={gamesPlayedStyle}>Games Played: {player.gamesPlayed}</p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

{loading ? 
  <div className="generate-analysis-container mt-6 p-4 bg-white rounded-lg shadow-lg">
    <div className="flex w-52 flex-col gap-4">
    <span className="loading loading-dots loading-lg"></span>
    <div className="skeleton h-4 w-28"></div>
    <div className="skeleton h-4 w-full"></div>
    <div className="skeleton h-4 w-full"></div>
    </div>
    </div>
: 
    <div className="generate-analysis-container mt-6 p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3">Automated Analysis</h3>

{/* Render the analysis with preserved formatting */}
<div className="analysis-result mt-6 p-4 bg-gray-100 rounded-lg">
  {/* Split the text by newline and map each line */}
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
<div className="text-end my-3">
  <button
    onClick={generateAnalysis}
    className="btn btn-success"
    disabled={loading}
  >
    {loading ? 'Generating...' : 'Generate Analysis'}
  </button>
</div>
          </div>}
          
    </div>
  );
};

export default MinigameAnalytics;