const mongoose = require('mongoose');

// Calculate win rate
const calculateWinRate = async (req, res) => {
  try {
    const minigamesCollection = mongoose.connection.collection('minigames');

    const totalGames = await minigamesCollection.countDocuments();
    const wins = await minigamesCollection.countDocuments({ 'stats.result': 'win' });

    const winRate = totalGames ? ((wins / totalGames) * 100).toFixed(2) : 0;
    res.status(200).json({ totalGames, wins, winRate });
  } catch (error) {
    console.error("Error calculating win rate:", error);
    res.status(500).json({ error: 'Error calculating win rate' });
  }
};

// Calculate average guesses for winning games
const calculateAverageGuesses = async (req, res) => {
    try {
      const minigamesCollection = mongoose.connection.collection('minigames');
  
      const games = await minigamesCollection.find({ 'stats.result': 'win' }).toArray();
  
      const totalGuesses = games.reduce((sum, game) => {
        const guesses = game.stats?.CIMWordle?.guesses;
        return guesses ? sum + guesses : sum;
      }, 0);
  
      const averageGuesses = games.length ? (totalGuesses / games.length).toFixed(2) : 0;
  
      // Return the result
      res.status(200).json({ averageGuesses, totalWins: games.length });
    } catch (error) {
      console.error("Error calculating average guesses:", error);
      res.status(500).json({ error: 'Error calculating average guesses' });
    }
  };
  
  

// Fetch active players by number of games played
const getMostActivePlayers = async (req, res) => {
    try {
      const minigamesCollection = mongoose.connection.collection('minigames');
  
      // Get the top 5 active players based on games played
      const activePlayers = await minigamesCollection.aggregate([
        { $group: { _id: "$userId", gamesPlayed: { $sum: 1 } } },
        { $sort: { gamesPlayed: -1 } },
        { $limit: 5 }
      ]).toArray();
  
      const userIds = activePlayers.map(player => player._id);
  
      const usersCollection = mongoose.connection.collection('users');
      const mobileUsersCollection = mongoose.connection.collection('mobileusers');
  

      const users = await usersCollection.find({ _id: { $in: userIds } }).toArray();
      const mobileUsers = await mobileUsersCollection.find({ _id: { $in: userIds } }).toArray();
  
      const allUsers = [...users, ...mobileUsers];
  
      // Add user details to active players
      const playerDetails = activePlayers.map(player => {
        const user = allUsers.find(u => u._id.toString() === player._id.toString());
        return { ...player, user };
      });
  
      res.status(200).json({ activePlayers: playerDetails });
    } catch (error) {
      console.error("Error fetching active players:", error);
      res.status(500).json({ error: 'Error fetching active players' });
    }
  };
  

// Calculate game outcomes distribution
const getGameOutcomes = async (req, res) => {
    try {
      const minigamesCollection = mongoose.connection.collection('minigames');
  
      // Aggregate the results by the 'stats.result' field (win/loss)
      const outcomeCounts = await minigamesCollection.aggregate([
        { $group: { _id: "$stats.result", count: { $sum: 1 } } }
      ]).toArray();
  
      res.status(200).json({ outcomeCounts });
    } catch (error) {
      console.error("Error fetching game outcomes:", error);
      res.status(500).json({ error: 'Error fetching game outcomes' });
    }
  };
  
  

// Get guess distribution for winning games
const getGuessDistribution = async (req, res) => {
    try {
      const minigamesCollection = mongoose.connection.collection('minigames');
      const guessDistribution = await minigamesCollection.aggregate([
        { $match: { 'stats.result': 'win' } }, // Only include wins
        { $group: { _id: "$stats.CIMWordle.guesses", count: { $sum: 1 } } }, 
        { $sort: { _id: 1 } }
      ]).toArray();
  
      res.status(200).json({ guessDistribution });
    } catch (error) {
      console.error("Error calculating guess distribution:", error);
      res.status(500).json({ error: 'Error calculating guess distribution' });
    }
  };
  
  // Get win streaks for each player
  const getWinStreaks = async (req, res) => {
    try {
      const minigamesCollection = mongoose.connection.collection('minigames');
      const usersCollection = mongoose.connection.collection('users');
      const mobileUsersCollection = mongoose.connection.collection('mobileusers');
    
      // Group by userId, and sort by playedAt to calculate streaks
      const playerGames = await minigamesCollection.aggregate([
        { $sort: { userId: 1, playedAt: 1 } },
        { $group: { _id: "$userId", games: { $push: "$stats.result" } } },
        {
          $lookup: {
            from: 'users', 
            localField: '_id', 
            foreignField: '_id', 
            as: 'user' 
          }
        },
        {
          $lookup: {
            from: 'mobileusers', 
            localField: '_id', 
            foreignField: '_id', 
            as: 'mobileUser' 
          }
        },
        {
          $project: {
            _id: 1, // Retain the userId
            games: 1, // Retain the game results
            userName: { 
              $ifNull: [
                { $arrayElemAt: ["$user.name", 0] }, 
                { $arrayElemAt: ["$mobileUser.name", 0] } 
              ] 
            },
          }
        }
      ]).toArray();
    
      // Calculate the streaks
      const streaks = playerGames.map(player => {
        let streak = 0;
        let maxStreak = 0;
    
        // Calculate the longest win streak for each player
        player.games.forEach(result => {
          if (result === 'win') {
            streak += 1;
            maxStreak = Math.max(maxStreak, streak);
          } else {
            streak = 0; // reset streak on a loss
          }
        });
    
        return { userName: player.userName || 'Unknown', maxStreak }; // Default to 'Unknown' if name is not found
      });
    
      res.status(200).json({ streaks });
    } catch (error) {
      console.error("Error calculating win streaks:", error);
      res.status(500).json({ error: 'Error calculating win streaks' });
    }
  };
  
  
  // Get active players by date
  const getActivePlayersByDate = async (req, res) => {
    try {
      const { date } = req.params;  // Accept date in 'YYYY-MM-DD' format
      const minigamesCollection = mongoose.connection.collection('minigames');
  
      // Match games played on the specified date
      const activePlayers = await minigamesCollection.aggregate([
        { $match: { playedAt: { $gte: new Date(date + 'T00:00:00Z'), $lt: new Date(date + 'T23:59:59Z') } } },
        { $group: { _id: "$userId", gamesPlayed: { $sum: 1 } } },
        { $sort: { gamesPlayed: -1 } }
      ]).toArray();
  
      const userIds = activePlayers.map(player => player._id);
      const usersCollection = mongoose.connection.collection('users');
      const mobileUsersCollection = mongoose.connection.collection('mobileusers');
  
      // Fetch user details
      const users = await usersCollection.find({ _id: { $in: userIds } }).toArray();
      const mobileUsers = await mobileUsersCollection.find({ _id: { $in: userIds } }).toArray();
      const allUsers = [...users, ...mobileUsers];
  
      // Add user details to active players
      const playerDetails = activePlayers.map(player => {
        const user = allUsers.find(u => u._id.toString() === player._id.toString());
        return { ...player, user };
      });
  
      res.status(200).json({ activePlayers: playerDetails });
    } catch (error) {
      console.error("Error fetching active players by date:", error);
      res.status(500).json({ error: 'Error fetching active players by date' });
    }
  };
  
  // Get guess distribution by player
  const getGuessDistributionByPlayer = async (req, res) => {
    try {
      const minigamesCollection = mongoose.connection.collection('minigames');
  
      // Aggregate guesses per player for wins only
      const guessDistribution = await minigamesCollection.aggregate([
        { $match: { 'stats.result': 'win' } },
        { $group: { _id: { userId: "$userId", guesses: "$stats.CIMWordle.guesses" }, count: { $sum: 1 } } },
        { $sort: { "_id.guesses": 1 } }
      ]).toArray();
  
      res.status(200).json({ guessDistribution });
    } catch (error) {
      console.error("Error calculating guess distribution by player:", error);
      res.status(500).json({ error: 'Error calculating guess distribution by player' });
    }
  };
  
  const getUsersWithClawMarks = async (req, res) => {
    const User = mongoose.connection.collection('users');
    const MobileUser = mongoose.connection.collection('mobileusers');
  
    try {
      const users = await User.find({ clawMarks: { $gt: 0 } }).toArray();
      const mobileUsers = await MobileUser.find({ clawMarks: { $gt: 0 } }).toArray();
  
      const allUsers = [...users, ...mobileUsers];
  
      const sortedUsers = allUsers.sort((a, b) => b.clawMarks - a.clawMarks);
  
      res.status(200).json(sortedUsers);
    } catch (error) {
      console.error("Error fetching users with clawMarks:", error);
      res.status(500).json({ error: "Failed to fetch users with clawMarks" });
    }
  };

  const calculateAverageTries = async (req, res) => { 
    try {
        const minigamesCollection = mongoose.connection.collection('minigames');

        // Aggregate data to calculate average tries per player and fetch user names
        const averageTriesPerPlayer = await minigamesCollection.aggregate([
            { 
                $match: { 
                    game: "Flappy CIM", 
                    'stats.result': 'win',
                    'stats.FlappyCIM.tries': { $exists: true }
                } 
            },
            { 
                $group: { 
                    _id: "$userId", 
                    totalTries: { $sum: "$stats.FlappyCIM.tries" }, 
                    gameCount: { $sum: 1 } 
                } 
            },
            { 
                $project: { 
                    userId: "$_id",
                    _id: 0,
                    averageTries: { $divide: ["$totalTries", "$gameCount"] }
                } 
            },
            // Join with users collection
            { 
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                } 
            },
            // Join with mobileusers collection
            { 
                $lookup: {
                    from: "mobileusers",
                    localField: "userId",
                    foreignField: "_id",
                    as: "mobileUserDetails"
                } 
            },
            { 
                $addFields: { 
                    userName: {
                        $cond: [
                            { $gt: [{ $size: "$userDetails" }, 0] }, // If user found in `users`
                            { $arrayElemAt: ["$userDetails.name", 0] },
                            { $cond: [
                                { $gt: [{ $size: "$mobileUserDetails" }, 0] }, // If user found in `mobileusers`
                                { $arrayElemAt: ["$mobileUserDetails.name", 0] },
                                "Unknown User" // Default fallback
                            ]}
                        ]
                    }
                } 
            },
            { 
                $project: { 
                    userDetails: 0,
                    mobileUserDetails: 0
                } 
            },
            { $sort: { userId: 1 } }
        ]).toArray();



        res.status(200).json({ averageTriesPerPlayer });
    } catch (error) {
        console.error("Error calculating average tries per player:", error);
        res.status(500).json({ error: 'Error calculating average tries per player' });
    }
};


const getTryDistribution = async (req, res) => {
  try {
      const minigamesCollection = mongoose.connection.collection('minigames');

      const tryDistribution = await minigamesCollection.aggregate([
          { 
              $match: { 
                  game: "Flappy CIM", 
                  'stats.result': 'win',
                  'stats.FlappyCIM.tries': { $exists: true }
              } 
          },
          { 
              $group: { 
                  _id: {
                      tries: "$stats.FlappyCIM.tries",
                      userId: "$userId"
                  }, 
                  count: { $sum: 1 } 
              } 
          },
          { 
              $lookup: { 
                  from: "users", 
                  localField: "_id.userId", 
                  foreignField: "_id", 
                  as: "userDetails" 
              } 
          },
          { 
              $lookup: { 
                  from: "mobileusers", 
                  localField: "_id.userId", 
                  foreignField: "_id", 
                  as: "mobileUserDetails" 
              } 
          },
          { 
              $addFields: { 
                  userName: {
                      $cond: [
                          { $gt: [{ $size: "$userDetails" }, 0] }, 
                          { $arrayElemAt: ["$userDetails.name", 0] },
                          { $cond: [
                              { $gt: [{ $size: "$mobileUserDetails" }, 0] }, 
                              { $arrayElemAt: ["$mobileUserDetails.name", 0] },
                              "Unknown User"
                          ]}
                      ]
                  }
              } 
          },
          { 
              $group: { 
                  _id: "$_id.tries",
                  userNames: { $addToSet: "$userName" }, 
                  totalPlayers: { $sum: "$count" }
              } 
          },
          { $sort: { _id: 1 } }
      ]).toArray();

    

      res.status(200).json({ tryDistribution });
  } catch (error) {
      console.error("Error calculating try distribution for Flappy CIM:", error);
      res.status(500).json({ error: 'Error calculating try distribution for Flappy CIM' });
  }
};




  
  

module.exports = {
  calculateWinRate,
  calculateAverageGuesses,
  getMostActivePlayers,
  getGameOutcomes,
  getGuessDistribution,
  getWinStreaks,
  getActivePlayersByDate,
  getGuessDistributionByPlayer,
  getUsersWithClawMarks,
  calculateAverageTries, 
  getTryDistribution
};
