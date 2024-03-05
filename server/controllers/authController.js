const User = require('../models/user')
const{hashPassword, comparePassword} = require('../helpers/auth')
const jwt = require('jsonwebtoken');


const test = (req, res) =>{
    res.json("Hello World Test")
}
//Registration ep
const registerUser = async(req, res)=> {
    try {
        const{name, studentemail,password,adminType} = req.body;
        //name field validation
        if(!name){
            return res.json({
                error: 'please input your name'
            })
        };
        //password validation
        if(!password || password.length<6){
            return res.json({
                error:'Please enter a password, should be more than 6 characters'
            })
        };
        //email validation
        const exist = await User.findOne({studentemail});
        if(!studentemail){
            return res.json({
                error:'Email is required!'
            })
        }
        if(exist){
            return res.json({
                error:'Email already exists'
            })
        }
        //adminType validation
        if(!adminType){
            return res.json({
                error:'Admin type is required!'
            });
        }

        const NotallowMultipleAdminType = ["School Owner", "President", "School Executive Admin","School Executive Dean"];
        if(NotallowMultipleAdminType.includes(adminType)){
            const existingAdmin = await User.findOne({adminType});
            if(existingAdmin){
                return res.json({
                    error: `A user with the admin type '${adminType}' already exists`
                })
            }
        }

        
        const hashedPassword = await hashPassword(password)


        const user = await User.create({
            name,
            studentemail,
            password: hashedPassword,
            adminType
        })

        return res.json(user)
    } catch (error) {
        console.log(error)
    }
};

//Login ep
const loginUser = async (req,res)=>{
    try {
        const{studentemail, password} = req.body;

        //user validation
        const user = await User.findOne({studentemail});
        if(!user){
            return res.json({
                error: 'No user found'
            })
        }
        const matchpass = await comparePassword(password, user.password)
        if(matchpass){
            jwt.sign({email: user.studentemail, id:user._id,name: user.name, adminType:user.adminType}, process.env.JWT_SECRET, {}, (err,token)=>{
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

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile
}