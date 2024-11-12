import React, { useEffect, useState } from 'react';  
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './MinigameAnalytics.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faAward, faGamepad} from '@fortawesome/free-solid-svg-icons';


const MinigameAnalytics = () => {
  const [winRate, setWinRate] = useState(null);
  const [averageGuesses, setAverageGuesses] = useState(null);
  const [activePlayers, setActivePlayers] = useState([]);
  const [guessDistribution, setGuessDistribution] = useState([]);
  const [winStreaks, setWinStreaks] = useState([]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([  // Fake leaderboard data for now
    { rank: 1, playerName: 'Player 1', clawmarks: 1500 },
    { rank: 2, playerName: 'Player 2', clawmarks: 1200 },
    { rank: 3, playerName: 'Player 3', clawmarks: 1000 },
    { rank: 4, playerName: 'Player 4', clawmarks: 800 },
    { rank: 5, playerName: 'Player 5', clawmarks: 600 },
    { rank: 6, playerName: 'Player 6', clawmarks: 500 }
  ]);

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
                text: `Analyze the following minigame data:
                
                * Win Rate: ${winRate.winRate}% 
                * Average Guesses for Wins: ${averageGuesses.averageGuesses}
                * Active Players: ${activePlayers.length}
                * Win Streaks: ${winStreaks.map(streak => `Player ${streak.playerName}: ${streak.streak}`).join(', ')}
                * Guess Distribution: ${guessDistribution.map(g => `${g._id} guesses: ${g.count}`).join(', ')}
                
                Provide an analysis of player performance and engagement.`
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
          maxOutputTokens: 500,
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
        .replace(/^\s*[-*]\s*/gm, '');

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
    name: streak.userId, 
    value: streak.maxStreak
  }));

  return (
    <div className=" border  p-4 rounded-lg " >
     <div className="flex flex-row bg-gradient-to-r from-black to-green-800 rounded-md">
      <div className="div">
        <img 
          src="/assets/CORPO_CIM/CIMdle_LOGO.png" 
          alt="CIMdle Logo" 
          className="h-[35vh] w-full opacity-50" 
        />
        </div>
        <div className=" ">
          
     
        </div>
      </div>

<div className="divider divider-warning"></div>
   

      {/* Analytics Section */}
      <div className="charts-section grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {/* Win Rate Chart */}
        {winRate && (
          <div className="chart-container p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Win Rate</h3>
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
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Guess Distribution</h3>
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
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Win Streaks</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={winStreakData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4bc0c0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

       {/* Leaderboard Section */}
       <div className="leaderboard-section mt-6 p-4 bg-white rounded-lg shadow-lg">
        <h3 className="text-3xl font-semibold text-green-800 mb-4 border-b border-yellow-500">Clawmarks Leaderboard <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 ml-2 text-3xl" /></h3>
        {leaderboard.length === 0 ? (
          <p className="text-lg text-gray-600">No leaderboard data available.</p>
        ) : (
          <div className="leaderboard-list">
            <ul className="list-none">
              {leaderboard.map((player, index) => (
                <li key={index} className="flex items-center p-3 mb-4 border-b">
                  {/* Rank and Trophy Icon */}
                  <div className="flex items-center w-1/6">
                    <span className={`rank-badge ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-500 text-white' : index === 2 ? 'bg-yellow-300 text-gray-800' : 'bg-gray-300'}`}>
                      {player.rank}
                    </span>
                    <FontAwesomeIcon 
                      icon={index === 0 ? faTrophy : index === 1 ? faMedal : faAward} 
                      className={`text-2xl ml-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : 'text-yellow-800'}`} 
                    />
                  </div>
                  
                  {/* Player's name and clawmarks */}
                  <div className="player-info flex justify-between w-5/6">
                    <div className="player-name text-lg font-semibold text-gray-800">{player.playerName}</div>
                    <div className="clawmarks text-xl font-bold text-green-800">{player.clawmarks} Clawmarks</div>
                  </div>
                </li>
              ))}
            </ul>
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
          playerStyle = "bg-yellow-25 border border-yellow-200 scale-100";
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
            
            <div className="analysis-result mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-lg text-gray-700 text-justify">{analysis}</p>

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
