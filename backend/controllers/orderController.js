import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import { hasAddressValue, normalizeAddress, normalizeAddressBook, upsertAddressBook } from '../utils/addressBook.js'

const DEFAULT_WEIGHT = 0.1

const normalizeOrderWeight = (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_WEIGHT
    }

    return parsed
}

const normalizeOrderQuantity = (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 0
    }

    return Math.floor(parsed)
}

const normalizeOrderItems = (items) => {
    if (!Array.isArray(items)) {
        return []
    }

    return items.reduce((normalizedItems, item) => {
        if (!item || typeof item !== 'object') {
            return normalizedItems
        }

        const quantity = normalizeOrderQuantity(item.quantity)
        if (quantity <= 0) {
            return normalizedItems
        }

        normalizedItems.push({
            ...item,
            quantity,
            weight: normalizeOrderWeight(item.weight)
        })

        return normalizedItems
    }, [])
}

// placing order  using cod

const placeOrder = async (req, res) => {
    try {
        const {userId, items, amount, address, clearCart = true, saveAddress = true, selectedAddressId = ''} = req.body
        const normalizedItems = normalizeOrderItems(items)
        const normalizedAddress = normalizeAddress(address)
        const shouldSaveAddress = saveAddress !== false
        const userData = await userModel.findById(userId)

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        if (normalizedItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Order items are required' })
        }

        const orderData = {
            userId,
            items: normalizedItems,
            amount,
            address: normalizedAddress,
            cancelRequestStatus: 'none',
            cancelRequestedAt: null,
            cancelRespondedAt: null,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()
        const userUpdate = {}
        let updatedAddressBook = normalizeAddressBook(userData.addresses, userData.address, userData.defaultAddressId)

        if (shouldSaveAddress && hasAddressValue(normalizedAddress)) {
            updatedAddressBook = upsertAddressBook({
                currentAddresses: userData.addresses,
                legacyAddress: userData.address,
                defaultAddressId: userData.defaultAddressId,
                nextAddress: normalizedAddress,
                selectedAddressId
            })

            userUpdate.address = normalizedAddress
            userUpdate.addresses = updatedAddressBook.addresses
            userUpdate.defaultAddressId = updatedAddressBook.defaultAddressId
        }

        if (clearCart) {
            userUpdate.cartData = {}
        }

        await userModel.findByIdAndUpdate(userId, userUpdate)
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            savedAddresses: updatedAddressBook.addresses,
            defaultAddressId: updatedAddressBook.defaultAddressId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const requestOrderCancellation = async (req, res) => {
    try {
        const { userId, orderId } = req.body

        const order = await orderModel.findOne({ _id: orderId, userId })
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'This order can no longer be cancelled' })
        }

        if (order.cancelRequestStatus === 'pending') {
            return res.status(400).json({ success: false, message: 'Cancellation request already sent' })
        }

        if (order.cancelRequestStatus === 'rejected') {
            return res.status(400).json({ success: false, message: 'Order can not be cancelled' })
        }

        if (order.cancelRequestStatus === 'approved') {
            return res.status(400).json({ success: false, message: 'This order has already been cancelled' })
        }

        order.cancelRequestStatus = 'pending'
        order.cancelRequestedAt = new Date()
        order.cancelRespondedAt = null
        await order.save()

        res.json({ success: true, message: 'Cancellation request sent successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

//placing order using stipe 
const placeOrderStripe = async (req, res) => {

}

//placing order using razorpay
const placeOrderRazorpay = async (req, res) => {

}

// all orders data for admin
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 })
        const normalizedOrders = orders.map((order) => ({
            ...order.toObject(),
            items: normalizeOrderItems(order.items)
        }))
        res.json({success: true, orders: normalizedOrders})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: error.message})
    }
}

//user data for frontend
const userOrders = async (req, res) => {
    try {
        const {userId} = req.body
        const orders = await orderModel.find({userId})
        const normalizedOrders = orders.map((order) => ({
            ...order.toObject(),
            items: normalizeOrderItems(order.items)
        }))
        res.json({success: true, orders: normalizedOrders})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: error.message})
    }
}

//update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const updateData = { status };

        if (status === 'Cancelled') {
            updateData.cancelRequestStatus = 'approved'
            updateData.cancelRespondedAt = new Date()
        }

        await orderModel.findByIdAndUpdate(orderId, updateData);
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const reviewCancelRequest = async (req, res) => {
    try {
        const { orderId, decision } = req.body

        if (!['approve', 'reject'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Invalid cancellation decision' })
        }

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        if (order.cancelRequestStatus !== 'pending') {
            return res.status(400).json({ success: false, message: 'No pending cancellation request for this order' })
        }

        order.cancelRequestStatus = decision === 'approve' ? 'approved' : 'rejected'
        order.cancelRespondedAt = new Date()

        if (decision === 'approve') {
            order.status = 'Cancelled'
        }

        await order.save()

        res.json({
            success: true,
            message: decision === 'approve' ? 'Cancellation approved' : 'Cancellation request rejected'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export {placeOrder, requestOrderCancellation, reviewCancelRequest, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus}
