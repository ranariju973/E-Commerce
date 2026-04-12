import express from "express";
import { registerUser, loginUser, adminLogin } from "../controllers/userController.js";


const userRouter = express.Router();

//route for user login
userRouter.post('/login', loginUser);

//route for user register
userRouter.post('/register', registerUser);

//route for admin login
userRouter.post('/admin', adminLogin);

export default userRouter;