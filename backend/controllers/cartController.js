import userModel from "../models/userModel.js"


// add product to user cart
const addToCart = async (req, res) => {
    try {
        const {userId, itemId, size} = req.body

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({success: false, message: 'User not found'})
        }

        let cartData = userData.cartData || {}
        if(cartData[itemId]) {
            if(cartData[itemId][size]) {
                cartData[itemId][size] += 1
            } else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1

        }

        await userModel.findByIdAndUpdate(userId, {cartData: cartData})

        res.json({success: true, message: 'Item added to cart'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Server error'})
    }
}

// update product in user cart
const updateCart = async (req, res) => {
    try {
        const {userId, itemId, size, quantity} = req.body

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({success: false, message: 'User not found'})
        }

        let cartData = userData.cartData || {}
        
        if(cartData[itemId]) {
            cartData[itemId][size] = quantity
        } else {
            return res.status(400).json({success: false, message: 'Item not found in cart'})
        }

        await userModel.findByIdAndUpdate(userId, {cartData: cartData})
        res.json({success: true, message: 'Cart updated successfully'})

    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Server error'})
    }
}

// get user cart data
const getUserCart = async (req, res) => {
    try {
        const {userId} = req.body

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({success: false, message: 'User not found'})
        }

        let cartData = userData.cartData || {}
        res.json({success: true, cartData})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Server error'})
    }
}

export {
    addToCart,
    updateCart,
    getUserCart
}