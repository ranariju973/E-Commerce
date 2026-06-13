import express from "express";
import { registerUser, loginUser, adminLogin, getUserProfile, updateUserProfile, googleAuth } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

//route for user login
userRouter.post('/login', loginUser);

//route for google auth
userRouter.post('/google', googleAuth);

//route for user register
userRouter.post('/register', registerUser);

//route for admin login
userRouter.post('/admin', adminLogin);

//route for user profile
userRouter.post('/profile', authUser, getUserProfile);

//route for updating user profile
userRouter.post('/update-profile', authUser, updateUserProfile);

export default userRouter;
