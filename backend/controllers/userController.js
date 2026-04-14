import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}


//route for user login
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // check if user exists
        const user = await userModel.findOne({ email });
        if(!user){
            return res.status(400).json({success: false, message: "User does not exist" });
        }

        // comparing password
        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            const token = createToken(user._id);
            res.status(200).json({success: true, message: "User logged in successfully", token });
        } else {
            res.status(400).json({success: false, message: "Invalid email or password" });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message });
    }

}

//route for user register
const registerUser = async (req, res) => {
    try{

        const { name, email, password } = req.body;

        // check if user already exists
        const exists = await userModel.findOne({ email });
        if(exists){
            return res.status(400).json({success: false, message: "User already exists" });
        }
        // validating email format and stronge password
        if(!validator.isEmail(email)){
            return res.status(400).json({success: false, message: "please enter a valid email" });
        }
        if(password.length < 8){
            return res.status(400).json({success: false, message: "password must be at least 8 characters long" });
        }

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // creating new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });
        const user = await newUser.save();

        const token = createToken(user._id);

        res.status(201).json({success: true, message: "User registered successfully", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message });
    }
}

//route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email, password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign({ role: email + password }, process.env.JWT_SECRET)
            res.json({success:true, token})
        } else {
            res.json({success:false, message:"invalid cardential"})
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin };