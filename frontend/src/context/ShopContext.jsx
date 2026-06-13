import { useCallback, useEffect, useRef, useState } from 'react'
import { ShopContext } from './ShopContext.js'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const ShopContextProvider = (props) => {

    const currency = '₹'
    const delivery_fee = 10;
    const defaultWeight = 0.1
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, '')
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [products, setProducts] = useState([])
    const [savedAddresses, setSavedAddresses] = useState([])
    const [defaultAddressId, setDefaultAddressId] = useState('')
    const [token, setToken] = useState(() => localStorage.getItem('token') || '')
    const authNoticeShownRef = useRef(false)
    const navigate = useNavigate()

    const normalizeWeight = useCallback((value) => {
        const parsed = Number(value)
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return defaultWeight
        }

        return parsed
    }, [defaultWeight])

    const normalizeCartData = useCallback((rawCartData) => {
        if (!rawCartData || typeof rawCartData !== 'object') {
            return {}
        }

        const normalized = {}

        for (const [itemId, itemValue] of Object.entries(rawCartData)) {
            if (typeof itemValue === 'number') {
                const quantity = Math.floor(Number(itemValue))
                if (quantity > 0) {
                    normalized[itemId] = {
                        quantity,
                        weight: defaultWeight
                    }
                }
                continue
            }

            if (itemValue && typeof itemValue === 'object') {
                if ('quantity' in itemValue || 'weight' in itemValue) {
                    const quantity = Math.floor(Number(itemValue.quantity))
                    if (quantity > 0) {
                        normalized[itemId] = {
                            quantity,
                            weight: normalizeWeight(itemValue.weight)
                        }
                    }
                    continue
                }

                let totalQuantity = 0
                for (const nestedQuantity of Object.values(itemValue)) {
                    const parsedQuantity = Math.floor(Number(nestedQuantity))
                    if (parsedQuantity > 0) {
                        totalQuantity += parsedQuantity
                    }
                }

                if (totalQuantity > 0) {
                    normalized[itemId] = {
                        quantity: totalQuantity,
                        weight: defaultWeight
                    }
                }
            }
        }

        return normalized
    }, [normalizeWeight])

    const handleAuthError = useCallback((error) => {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            return false
        }

        const responseCode = error.response?.data?.code
        const responseMessage = `${error.response?.data?.message || ''}`.toLowerCase()
        const isExpiredToken = responseCode === 'TOKEN_EXPIRED' || responseMessage.includes('token expired') || responseMessage.includes('jwt expired')

        setToken('')
        localStorage.removeItem('token')
        setCartItems({})
        setSavedAddresses([])
        setDefaultAddressId('')

        if (!authNoticeShownRef.current) {
            toast.error(isExpiredToken ? 'Session expired. Please log in again.' : 'Please log in again to continue.')
            authNoticeShownRef.current = true
        }

        navigate('/login')
        return true
    }, [navigate])

    const getUserCart = useCallback(async (authToken) => {
        try {
            const response = await axios.post(`${backendUrl}/api/cart/get`, {}, {
                headers: {
                    token: authToken
                }
            })

            if (response.data.success) {
                setCartItems(normalizeCartData(response.data.cartData))
            }
        } catch (error) {
            if (handleAuthError(error)) {
                return
            }

            console.log(error)
            toast.error('Failed to load cart data')
        }
    }, [backendUrl, handleAuthError, normalizeCartData])

    const getUserProfile = useCallback(async (authToken) => {
        try {
            const response = await axios.post(`${backendUrl}/api/user/profile`, {}, {
                headers: {
                    token: authToken
                }
            })

            if (response.data.success) {
                setSavedAddresses(response.data.profile?.addresses || [])
                setDefaultAddressId(response.data.profile?.defaultAddressId || '')
            }
        } catch (error) {
            if (handleAuthError(error)) {
                return
            }

            console.log(error)
            toast.error('Failed to load saved address')
        }
    }, [backendUrl, handleAuthError])


    const addToCart = async(itemId, quantity = 1, weight = 1) => {
        const cartData = structuredClone(cartItems)
        const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
        const normalizedWeight = normalizeWeight(weight)
        const existingCartItem = cartData[itemId] || { quantity: 0, weight: normalizedWeight }

        cartData[itemId] = {
            quantity: existingCartItem.quantity + normalizedQuantity,
            weight: normalizedWeight
        }
        setCartItems(cartData)

        const authToken = token || localStorage.getItem('token')

        if(authToken) {
            try {
                await axios.post(`${backendUrl}/api/cart/add`, {
                    itemId,
                    quantity: normalizedQuantity,
                    weight: normalizedWeight
                }, {
                    headers: {
                        token: authToken
                    }
                })
            } catch (error) {
                if (handleAuthError(error)) {
                    return
                }

                console.log(error)
                toast.error('Failed to add item to cart') 
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0
        for (const item of Object.values(cartItems)) {
            try {
                const quantity = Number(item?.quantity || 0)
                if (quantity > 0) {
                    totalCount += quantity
                }
            } catch(error) {
                console.log(error)
            }
        }

        return totalCount
    }

    const updateQuantity = async (itemId, quantity, weight) => {
        let cartData = structuredClone(cartItems)
        const existingCartItem = cartData[itemId] || { quantity: 0, weight: defaultWeight }
        const normalizedWeight = normalizeWeight(weight ?? existingCartItem.weight)

        if (quantity <= 0) {
            delete cartData[itemId]
        } else {
            cartData[itemId] = {
                quantity,
                weight: normalizedWeight
            }
        }

        setCartItems(cartData)

        const authToken = token || localStorage.getItem('token')

        if(authToken) {
            try {
                await axios.post(`${backendUrl}/api/cart/update`, {
                    itemId,
                    quantity,
                    weight: normalizedWeight
                }, {
                    headers: {
                        token: authToken
                    }
                })
            } catch (error) {
                if (handleAuthError(error)) {
                    return
                }

                console.log(error)
                toast.error('Failed to update cart')
            }
        }
    }

    const getCartAmount =  () => {
        let totalAmount = 0
        for (const [itemId, cartItem] of Object.entries(cartItems)) {
            const itemInfo = products.find((product) => product._id === itemId)
            try {
                const quantity = Number(cartItem?.quantity || 0)
                if (itemInfo && quantity > 0) {
                    totalAmount += quantity * itemInfo.price
                }
            } catch(error) {
                console.log(error)
            }
        }

        return totalAmount
    }

    const getProductsData = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`, { timeout: 10000 })
            if (response.data.success) {
                setProducts(response.data.products)
            } else {
                toast.error(response.data.message || 'Failed to load products')
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const failedUrl = error.config?.url || `${backendUrl}/api/product/list`
                console.error('Product fetch failed', {
                    url: failedUrl,
                    code: error.code,
                    message: error.message
                })

                toast.error(`AxiosError: ${error.message}. Check backend URL: ${backendUrl}`)
                return
            }

            console.log(error)
            toast.error('Failed to load products')
        }
    }, [backendUrl])

    useEffect(() => {
        const loadProducts = setTimeout(() => {
            getProductsData()
        }, 0)

        return () => clearTimeout(loadProducts)
    }, [getProductsData])

    useEffect(() => {
        if (token) {
            authNoticeShownRef.current = false

            const loadUserData = setTimeout(() => {
                getUserProfile(token)
                getUserCart(token)
            }, 0)

            return () => clearTimeout(loadUserData)
        }

        setSavedAddresses([])
        setDefaultAddressId('')
        setCartItems({})
    }, [token, getUserCart, getUserProfile])

    const logoutUser = () => {
        setToken('')
        localStorage.removeItem('token')
        setCartItems({})
        setSavedAddresses([])
        setDefaultAddressId('')
        navigate('/login')
    }

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        addToCart,
        updateQuantity,
        getCartCount,
        getCartAmount,
        navigate,
        backendUrl,
        token,
        setToken,
        savedAddresses,
        setSavedAddresses,
        defaultAddressId,
        setDefaultAddressId,
        refreshUserProfile: getUserProfile,
        logoutUser
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider
