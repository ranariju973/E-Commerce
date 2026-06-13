import userModel from "../models/userModel.js"
import productModel from "../models/productsModel.js"
import mongoose from "mongoose"

const DEFAULT_WEIGHT = 0.1

const normalizeQuantity = (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 0
    }

    return Math.floor(parsed)
}

const normalizeWeight = (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_WEIGHT
    }

    return parsed
}

const normalizeCartData = (rawCartData) => {
    const normalizedCart = {}

    if (!rawCartData || typeof rawCartData !== 'object') {
        return normalizedCart
    }

    for (const [itemId, itemValue] of Object.entries(rawCartData)) {
        if (typeof itemValue === 'number') {
            const quantity = normalizeQuantity(itemValue)
            if (quantity > 0) {
                normalizedCart[itemId] = {
                    quantity,
                    weight: DEFAULT_WEIGHT
                }
            }
            continue
        }

        if (itemValue && typeof itemValue === 'object') {
            if ('quantity' in itemValue || 'weight' in itemValue) {
                const quantity = normalizeQuantity(itemValue.quantity)
                if (quantity > 0) {
                    normalizedCart[itemId] = {
                        quantity,
                        weight: normalizeWeight(itemValue.weight)
                    }
                }
                continue
            }

            let totalQuantity = 0
            for (const nestedQuantity of Object.values(itemValue)) {
                totalQuantity += normalizeQuantity(nestedQuantity)
            }

            if (totalQuantity > 0) {
                normalizedCart[itemId] = {
                    quantity: totalQuantity,
                    weight: DEFAULT_WEIGHT
                }
            }
        }
    }

    return normalizedCart
}

const filterCartByExistingProducts = async (cartData) => {
    const normalizedCart = normalizeCartData(cartData)
    const itemIds = Object.keys(normalizedCart)

    if (itemIds.length === 0) {
        return normalizedCart
    }

    const validMongoItemIds = itemIds.filter((itemId) => mongoose.Types.ObjectId.isValid(itemId))

    if (validMongoItemIds.length === 0) {
        return {}
    }

    const existingProducts = await productModel.find(
        { _id: { $in: validMongoItemIds } },
        { _id: 1 }
    ).lean()

    const existingProductIds = new Set(existingProducts.map((product) => String(product._id)))

    return Object.fromEntries(
        Object.entries(normalizedCart).filter(([itemId]) => existingProductIds.has(itemId))
    )
}


// add product to user cart
const addToCart = async (req, res) => {
    try {
        const userId = req.body?.userId
        const itemId = `${req.body?.itemId || ''}`.trim()
        const quantityToAdd = normalizeQuantity(req.body?.quantity || 1)
        const weight = normalizeWeight(req.body?.weight || DEFAULT_WEIGHT)

        if (!itemId) {
            return res.status(400).json({success: false, message: 'Item id is required'})
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({success: false, message: 'User not found'})
        }

        const cartData = await filterCartByExistingProducts(userData.cartData)
        const existingItem = cartData[itemId] || { quantity: 0, weight }
        cartData[itemId] = {
            quantity: existingItem.quantity + quantityToAdd,
            weight
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
        const userId = req.body?.userId
        const itemId = `${req.body?.itemId || ''}`.trim()
        const quantity = Number(req.body?.quantity)
        const weight = normalizeWeight(req.body?.weight || DEFAULT_WEIGHT)

        if (!itemId) {
            return res.status(400).json({success: false, message: 'Item id is required'})
        }

        if (!Number.isFinite(quantity) || quantity < 0) {
            return res.status(400).json({success: false, message: 'Quantity must be 0 or greater'})
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({success: false, message: 'User not found'})
        }

        const cartData = await filterCartByExistingProducts(userData.cartData)
        
        if(Math.floor(quantity) === 0) {
            delete cartData[itemId]
        } else {
            cartData[itemId] = {
                quantity: Math.floor(quantity),
                weight
            }
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

        const cartData = await filterCartByExistingProducts(userData.cartData)
        const hadInvalidItems = Object.keys(normalizeCartData(userData.cartData)).length !== Object.keys(cartData).length

        if (hadInvalidItems) {
            await userModel.findByIdAndUpdate(userId, {cartData: cartData})
        }

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
