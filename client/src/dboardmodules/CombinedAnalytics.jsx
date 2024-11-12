import React, { useContext, useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip, Legend, XAxis, YAxis, CartesianGrid, Brush } from 'recharts';
import axios from 'axios';
import { UserContext } from '../../context/userContext';

const CombinedAnalytics = () => {
  const { user } = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [activePlayersData, setActivePlayersData] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalDislikes, setTotalDislikes] = useState(0);
  const [activePlayersEngagement, setActivePlayersEngagement] = useState({});

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetching engagement and active players data
        const [engagementRes, activePlayersRes] = await Promise.all([
          axios.get(`/count-reactions-date/${user.id}`),
          axios.get('/active-players')
        ]);

        // Extract engagement data
        const engagementData = engagementRes.data.formattedData || [];
        let likesCount = 0;
        let dislikesCount = 0;

        // Aggregate likes and dislikes from engagement data
        engagementData.forEach(entry => {
          likesCount += entry.likes || 0;
          dislikesCount += entry.dislikes || 0;
        });

        // Extract active players data
        const activePlayers = activePlayersRes.data.activePlayers || [];
        const totalGamesPlayed = activePlayers.reduce((sum, player) => sum + player.gamesPlayed, 0);
        
        // Calculate total likes/dislikes from active players
        let activePlayersLikes = 0;
        let activePlayersDislikes = 0;
        let activePlayersGamesPlayed = 0;

        activePlayers.forEach(player => {
          activePlayersLikes += player.likes || 0;
          activePlayersDislikes += player.dislikes || 0;
          activePlayersGamesPlayed += player.gamesPlayed || 0;
        });

        // Set the total values in state
        setActivePlayersData(totalGamesPlayed);
        setTotalLikes(likesCount);
        setTotalDislikes(dislikesCount);

        // Step 1: Normalize engagement data
        const transformedData = engagementData.map((entry) => {
          const gamesPlayed = entry.gamesPlayed || 1; // Avoid division by 0
          const likesPerGame = entry.likes / gamesPlayed;
          const dislikesPerGame = entry.dislikes / gamesPlayed;
          const netEngagement = (entry.likes - entry.dislikes) / gamesPlayed;

          return {
            date: entry.date,
            likesPerGame,
            dislikesPerGame,
            netEngagement,
          };
        });

        // Calculate engagement for active players
        const activePlayersLikesPerGame = activePlayersLikes / activePlayersGamesPlayed || 0;
        const activePlayersDislikesPerGame = activePlayersDislikes / activePlayersGamesPlayed || 0;
        const activePlayersNetEngagement = (activePlayersLikes - activePlayersDislikes) / activePlayersGamesPlayed || 0;

        setActivePlayersEngagement({
          likesPerGame: activePlayersLikesPerGame,
          dislikesPerGame: activePlayersDislikesPerGame,
          netEngagement: activePlayersNetEngagement,
        });

        // Set the normalized data for chart rendering
        setAnalyticsData(transformedData);

      } catch (error) {
        console.error('Error fetching combined analytics data:', error);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-3xl text-gray-700 mb-4">Combined Analytics: Engagement vs. Active Players</h2>

      <div className="mb-4">
        <p>Total Games Played (Active Players): {activePlayersData}</p>
        <p>Total Likes: {totalLikes}</p>
        <p>Total Dislikes: {totalDislikes}</p>
        <p>Active Players' Likes per Game: {activePlayersEngagement.likesPerGame}</p>
        <p>Active Players' Dislikes per Game: {activePlayersEngagement.dislikesPerGame}</p>
        <p>Active Players' Net Engagement: {activePlayersEngagement.netEngagement}</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={analyticsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Line Chart for Engagement Metrics */}
          <Line type="monotone" dataKey="likesPerGame" stroke="#36a2eb" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="dislikesPerGame" stroke="#ff5733" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="netEngagement" stroke="#4caf50" activeDot={{ r: 8 }} />

          {/* Active Players' Metrics */}
          <Line type="monotone" dataKey={() => activePlayersEngagement.likesPerGame} stroke="#1e90ff" dot={false} />
          <Line type="monotone" dataKey={() => activePlayersEngagement.netEngagement} stroke="#ff6347" dot={false} />
          
          {/* Brush for range selection */}
          <Brush />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedAnalytics;
