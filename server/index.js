const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const {mongoose} = require('mongoose')
const app = express();
const cookieParser = require('cookie-parser')




//db connection
mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log('konektado na sa database'))
.catch((err)=> console.log('hindi konektado sa database'))


//midware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

app.use('/api/calendar', require("./controllers/CalendarController"))
app.use('/', require('./routes/authRouter'))

const port = 8000;
app.listen(port, ()=> console.log('Ang server na ito ay tumatakbo sa server na '+port))