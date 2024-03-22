const User = require('../models/user')
const{hashPassword, comparePassword} = require('../helpers/auth')
const jwt = require('jsonwebtoken');


const test = (req, res) =>{
    res.json("Hello World Test")
}
//Registration ep
const registerUser = async (req, res) => {
    try {
        const { name, studentemail, password, adminType, position, organization } = req.body;
        //name field validation
        if (!name) {
            return res.json({
                error: 'please input your name'
            });
        }
        //password validation
        if (!password || password.length < 6) {
            return res.json({
                error: 'Please enter a password, should be more than 6 characters'
            });
        }
        //email validation
        const exist = await User.findOne({ studentemail });
        if (!studentemail) {
            return res.json({
                error: 'Email is required!'
            });
        }
        if (exist) {
            return res.json({
                error: 'Email already exists'
            });
        }
        //adminType validation
        if (!adminType) {
            return res.json({
                error: 'Admin type is required!'
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create user
        let user;
        if (adminType === 'Organization Officer') {
            // Create user with position and organization for Organization Officer
            if (!position || !organization) {
                return res.json({
                    error: 'Position and organization are required for Organization Officer'
                });
            }
            user = await User.create({
                name,
                studentemail,
                password: hashedPassword,
                adminType,
                position,
                organization
            });
        } else {
            // Create user without position and organization for other admin types
            user = await User.create({
                name,
                studentemail,
                password: hashedPassword,
                adminType
            });
        }

        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Login ep
const loginUser = async (req,res)=>{
    try {
        const{studentemail, password} = req.body;

        //user validation
        const user = await User.findOne({studentemail});
        console.log('found user: ', user);
        if(!user){
            return res.json({
                error: 'No user found'
            })
        }
        const matchpass = await comparePassword(password, user.password)
        if(matchpass){
            jwt.sign({email: user.studentemail, id:user._id,name: user.name, adminType:user.adminType}, process.env.JWT_SECRET, {expiresIn: '24h'}, (err,token)=>{
                if(err) throw err;
                res.cookie('token', token).json(user)
            } )
        }
        if(!matchpass){
            res.json({
                error:'Wrong Password'
            })
        }
    } catch (error) {
        console.log(error)
    }

}

const getProfile=(req,res)=>{
const{token} = req.cookies
if(token){
    jwt.verify(token, process.env.JWT_SECRET, {},(err, user)=>{
        if(err) throw err;
        res.json(user)
    })
}else {
    res.json(null)
}
}

const logoutUser = async (req, res) => {
    try{
        const token = req.cookies.token; // Retrieve token from the client
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Expire the token by setting its expiration time to a past date
        res.cookie('token', '', { expires: new Date(0) });

        res.json({ message: 'Logout successful' });
    }
    catch(error){
        res.status(500).json({error: "Internal Server Error"});
    }
    
}

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile,
    logoutUser
}   