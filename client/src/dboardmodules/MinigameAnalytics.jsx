import React, { useEffect, useState } from 'react';  
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './MinigameAnalytics.css';

const MinigameAnalytics = () => {
  const [winRate, setWinRate] = useState(null);
  const [averageGuesses, setAverageGuesses] = useState(null);
  const [activePlayers, setActivePlayers] = useState([]);
  const [guessDistribution, setGuessDistribution] = useState([]);
  const [winStreaks, setWinStreaks] = useState([]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="minigame-analytics-container p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-xl">
      <div className="game-indicator bg-yellow-500 p-2 rounded-full text-center text-white font-semibold mb-6">
        CIM Wordle Analytics
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">Minigame Analytics</h2>

      {/* Analytics Section */}
      <div className="charts-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Active Players Section */}
      <div className="active-players-container mt-6 p-4 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Top Active Players</h3>
        {activePlayers.length === 0 ? (
          <p className="text-lg text-gray-600">No active players found.</p>
        ) : (
          <div className="players-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlayers.map((player, index) => (
              <div key={index} className="player-card bg-gray-100 p-4 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img
                    src={player.user.profilePicture || 'https://via.placeholder.com/100'}
                    alt={player.user.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">{player.user.name}</h4>
                    <p className="text-sm text-gray-600">{player.user.studentemail}</p>
                    <p className="text-sm text-gray-600">{player.user.section}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg text-gray-800">Games Played: {player.gamesPlayed}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="generate-analysis-container mt-6 p-4 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Automated Analysis</h3>
        <div className="text-center">
          <button
            onClick={generateAnalysis}
            className="generate-btn px-6 py-2 bg-purple-500 text-white rounded-lg shadow-md"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Analysis'}
          </button>
        </div>
        <div className="analysis-result mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-lg text-gray-700">{analysis}</p>
        </div>
      </div>
    </div>
  );
};

export default MinigameAnalytics;
