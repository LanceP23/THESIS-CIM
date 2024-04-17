const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const {mongoose} = require('mongoose')
const app = express();
const cookieParser = require('cookie-parser')
const path = require('path');
const socketIo = require('socket.io');
const {initializeSocket} = require('./socketManager');

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

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


app.use('/', require('./routes/authRouter'));

const port = 8000;
const server = app.listen(port, ()=> console.log('Ang server na ito ay tumatakbo sa server na '+port))

initializeSocket(server);

