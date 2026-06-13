import express from 'express';
import {placeOrder, requestOrderCancellation, reviewCancelRequest, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router()

//admin features
orderRouter.post('/list',adminAuth, allOrders)
orderRouter.post('/status',adminAuth, updateStatus)
orderRouter.post('/cancel/review',adminAuth, reviewCancelRequest)


//pyament features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

//user features
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/cancel/request', authUser, requestOrderCancellation)

export default orderRouter
