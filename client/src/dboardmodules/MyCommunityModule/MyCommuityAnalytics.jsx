import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip as RechartTooltip } from 'recharts';
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
          formattedData: dateResponse.data.formattedData,
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
            return isWithinInterval(date, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
          case 'all':
          default:
            return true;
        }
      })
    : [];

  const pieData = Object.entries(reactionsByEducationLevel).map(([key, value], index) => ({
    name: key,
    value,
    color: COLORS[index % COLORS.length],
  })).filter(entry => entry.value > 0);

  return (
    <div className="mt-16 p-3 w-full">
      <div className="mb-4 text-left">
        <label className="text-lg font-semibold" htmlFor="dateFilter">Filter by:</label>
        <select
          id="dateFilter"
          className="flex flex-row justify-items-start mt-1 mr-2 py-1 px-3 border border-green-300 bg-white rounded-md shadow-md"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="monthly">This Month</option>
          <option value="all">All</option>
        </select>
      </div>
      
      {/* Line Chart Section */}
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

      {/* Pie Chart Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-500 text-green-800">User Demographics</h2>
        <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row xl:flex-row">
          <div className="p-4 bg-white shadow-lg rounded-lg w-full my-2 mr-5">
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
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div>No demographic data available.</div>
            )}
          </div>
          
          {/* Demographics Description */}
          <div className="p-4  bg-gray-100 shadow-lg rounded-lg w-full sm:w-full md:w-full lg:w-1/2 xl:w-1/2 my-2 ">
            <h3 className="text-lg font-semibold mb-2 text-green-700">Demographic Breakdown</h3>
            <ul>
              {pieData.map((entry, index) => (
                <li key={index} className="mb-2 flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-gray-700 font-medium">{entry.name}</span>: {entry.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCommunityAnalytics;
