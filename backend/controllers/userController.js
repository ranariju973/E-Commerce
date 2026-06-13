import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import { normalizeAddressBook } from "../utils/addressBook.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);


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

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body

        const user = await userModel.findById(userId).select('name email address addresses defaultAddressId')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const addressBook = normalizeAddressBook(user.addresses, user.address, user.defaultAddressId)
        const nameParts = `${user.name || ''}`.trim().split(/\s+/).filter(Boolean)

        const hydratedAddresses = addressBook.addresses.map((address) => {
            const hydratedAddress = { ...address }

            if (!hydratedAddress.email) {
                hydratedAddress.email = user.email || ''
            }

            if (!hydratedAddress.firstName && nameParts.length > 0) {
                hydratedAddress.firstName = nameParts[0]
            }

            if (!hydratedAddress.lastName && nameParts.length > 1) {
                hydratedAddress.lastName = nameParts.slice(1).join(' ')
            }

            return hydratedAddress
        })

        const shouldUpdateAddressBook = JSON.stringify(user.addresses || []) !== JSON.stringify(addressBook.addresses)
            || `${user.defaultAddressId || ''}` !== addressBook.defaultAddressId

        if (shouldUpdateAddressBook) {
            await userModel.findByIdAndUpdate(userId, {
                addresses: addressBook.addresses,
                defaultAddressId: addressBook.defaultAddressId
            })
        }

        res.json({
            success: true,
            profile: {
                name: user.name,
                email: user.email,
                addresses: hydratedAddresses,
                defaultAddressId: addressBook.defaultAddressId
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}
const updateUserProfile = async (req, res) => {
    try {
        const { userId, name, addresses, defaultAddressId } = req.body

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (addresses !== undefined) updateData.addresses = addresses
        if (defaultAddressId !== undefined) updateData.defaultAddressId = defaultAddressId

        await userModel.findByIdAndUpdate(userId, updateData)

        res.json({ success: true, message: 'Profile updated successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

//route for google auth
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: "Google credential is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await userModel.findOne({ email });

        if (!user) {
            // Create new user
            const newUser = new userModel({
                name,
                email,
                authProvider: 'google'
            });
            user = await newUser.save();
        }

        const token = createToken(user._id);
        res.status(200).json({ success: true, message: "Logged in successfully", token });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ success: false, message: 'Google Authentication failed' });
    }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, googleAuth };
