import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const COLORS = ['#E38627', '#C13C37', '#6A2133', '#42A5F5', '#66BB6A'];

const MyCommunityAnalytics = ({ communityId }) => {
  const [communityData, setCommunityData] = useState(null);
  const [dateFilter, setDateFilter] = useState('monthly'); // 'monthly' filter by default

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!communityId) {
          console.warn('communityId is not available for fetching data:', communityId);
          return;
        }

        const reactionsResponse = await axios.get(`/community/${communityId}/reactions`);
        const educationResponse = await axios.get(`/community/${communityId}/reactions/education-level`);
        const dateResponse = await axios.get(`/community/${communityId}/reactions/date`);

        setCommunityData({
          totalReactions: reactionsResponse.data,
          reactionsByEducationLevel: educationResponse.data.educationLevelCounters,
          formattedData: dateResponse.data.formattedData, // Ensure this data is in correct format
        });
      } catch (error) {
        console.error('Error fetching community data:', error);
      }
    };

    fetchData();
  }, [communityId]);

  if (!communityData) {
    return <div>Loading...</div>;
  }

  const { reactionsByEducationLevel, formattedData } = communityData;


  const filteredData = Array.isArray(formattedData)
    ? formattedData.filter((data) => {
        const date = parseISO(data.date);
        switch (dateFilter) {
          case 'monthly':
            // Filter for the current month
            return isWithinInterval(date, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
          case 'all':
          default:
            return true; 
        }
      })
    : [];


  // Prepare pie chart data
  const pieData = Object.entries(reactionsByEducationLevel).map(([key, value], index) => ({
    name: key,
    value,
    color: COLORS[index % COLORS.length],
  })).filter(entry => entry.value > 0); // Filter out zero values to avoid showing empty slices


  return (
    <div className="mt-16 p-3">
      <h1 className="text-4xl font-bold mb-4 text-left text-green-800">My Community Analytics</h1>

      <div className="mb-4">
        <label className="text-xl font-semibold text-green-800" htmlFor="dateFilter">Filter by:</label>
        <select
          id="dateFilter"
          className="ml-2 p-2 border border-gray-300 rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="monthly">This Month</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="p-4 bg-white shadow-lg rounded-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-green-800">Reactions by Date</h2>
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="likes" stroke="#8884d8" />
              <Line type="monotone" dataKey="dislikes" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div>No data available for this period.</div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-500 text-green-800">User Demographics</h2>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          {pieData.length > 0 ? (
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
                  label={(entry) => `${entry.name}: ${entry.value}`} // Label shows the name and value
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div>No demographic data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCommunityAnalytics;
