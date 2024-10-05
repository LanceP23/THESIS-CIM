const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const address = require('address');
const { initializeSocket } = require('./socketManager');
const { app, server } = require('./socketManager');
const { startBackgroundTasks } = require('./helpers/backgroundTask');

// Get local IP for development
const localIp = address.ip();

// CORS configuration for development and production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL] : ['http://localhost:5173', `http://${localIp}:5173`],
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/assets', express.static(path.join(__dirname, '..client/dist/assets')));

// Routes
app.use('/', require('./routes/authRouter'));
app.use("/api/messages", require('./routes/messageRouter'));
app.use("/api/users", require('./routes/userRoutes'));

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Successfully connected to the database'))
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit the application if the DB connection fails
    });

    console.log('Environment:', process.env.NODE_ENV);
// Static files (only for production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));  

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    });
    
}

// Start background tasks
startBackgroundTasks();



// Error handling for unknown routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Central error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
