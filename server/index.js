const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const {mongoose} = require('mongoose')
const cookieParser = require('cookie-parser')
const path = require('path');
const socketIo = require('socket.io');
const {initializeSocket} = require('./socketManager');
const address = require('address');

const localIp = address.ip();
const corsOptions = {
    origin: ['http://localhost:5173', 'http://192.168.1.19:5173'],
    credentials: true,
};
const {app, server} =require('./socketManager');
const { startBackgroundTasks } = require('./helpers/backgroundTask');

app.use(cors(corsOptions));

//db connection
mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log('konektado na sa database'))
.catch((err)=> console.log('hindi konektado sa database'))


//midware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.use("/assets", express.static(path.join(__dirname, "assets")));

startBackgroundTasks();

app.use('/', require('./routes/authRouter'));
app.use("/api/messages", require('./routes/messageRouter'));
app.use("/api/users", require('./routes/userRoutes'));


const port = 8000;
server.listen(port, ()=> console.log('Ang server na ito ay tumatakbo sa server na '+port))



