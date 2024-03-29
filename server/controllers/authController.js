const User = require('../models/user')
const{hashPassword, comparePassword} = require('../helpers/auth')
const jwt = require('jsonwebtoken');


const test = (req, res) =>{
    res.json("Hello World Test")
}
//Registration ep
const registerUser = async (req, res) => {
    try {
        const { name, studentemail, password, adminType, position, schoolYear,department,organization } = req.body;

        if (adminType === 'School Owner' || adminType === 'President') {
            const existingUser = await User.findOne({ adminType });
            if (existingUser) {
                return res.json({ error: `There can only be one ${adminType} in the system` });
            }
        }
        
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentemail)) {
            return res.json({
                error: 'Invalid email format'
            });
        }

        const allowedDomains = ['gmail.com', 'example.org']; 
        const domain = studentemail.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            return res.json({
                error: 'Invalid email domain'
            });
        }

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

        // Create user based sa registration type 
        switch (adminType) {
            case 'School Owner':
            case 'President':
            case 'School Executive Admin':
            case 'School Executive Dean':
                // For staff registration
                user = await User.create({
                    name,
                    studentemail,
                    password: hashedPassword,
                    adminType,
                });
                break;
            case 'Program Head':
            case 'Instructor':
                // For faculty registration
                if (!department || !schoolYear) {
                    return res.status(400).json({ error: 'Department and school year are required for faculty registration' });
                }
                user = await User.create({
                    name,
                    studentemail,
                    password: hashedPassword,
                    adminType,
                    department,
                    schoolYear,
                });
                break;
            case 'Organization Officer':
                // For student registration
                if (!position || !schoolYear) {
                    return res.status(400).json({ error: 'position and school year are required for student registration' });
                }
                user = await User.create({
                    name,
                    studentemail,
                    password: hashedPassword,
                    adminType,
                    organization,
                    position,
                    schoolYear,
                });
                break;
            case 'Student Government':
                // For student government registration
                if (!position || !schoolYear) {
                    return res.status(400).json({ error: 'Position and school year are required for student government registration' });
                }
                user = await User.create({
                    name,
                    studentemail,
                    password: hashedPassword,
                    adminType,
                    position,
                    schoolYear,
                });
                break;
            default:
                return res.status(400).json({ error: 'Invalid admin type' });
        }

        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Login ep
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
    try {
        const { studentemail, password } = req.body;

        // Find user by email
        const user = await User.findOne({ studentemail });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        jwt.sign(
            { email: user.studentemail, id: user._id, name: user.name, adminType: user.adminType },
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                // Send the token and adminType in the response
                res.cookie('token', token).json({ token, adminType: user.adminType });
            }
        );
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const checkAuth = (req, res) => {
    try {
        // Check if token is present in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.json({ authenticated: false });
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.json({ authenticated: false });
            }
            // If token is valid, user is authenticated
            return res.json({ authenticated: true });
        });
    } catch (error) {
        console.error('Error checking authentication status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


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
    checkAuth,
    getProfile,
    logoutUser
}   