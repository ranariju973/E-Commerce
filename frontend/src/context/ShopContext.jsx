import { useCallback, useEffect, useRef, useState } from 'react'
import { ShopContext } from './ShopContext.js'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const ShopContextProvider = (props) => {

    const currency = '₹'
    const delivery_fee = 10;
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, '')
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [products, setProducts] = useState([])
    const [token, setToken] = useState(() => localStorage.getItem('token') || '')
    const authNoticeShownRef = useRef(false)
    const navigate = useNavigate()

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
                setCartItems(response.data.cartData || {})
            }
        } catch (error) {
            if (handleAuthError(error)) {
                return
            }

            console.log(error)
            toast.error('Failed to load cart data')
        }
    }, [backendUrl, handleAuthError])


    const addToCart = async(itemId, size) => {
        let cartData = structuredClone(cartItems)

        if(!size) {
            toast.error('Please select a size before adding to cart')
            return
        }

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
        setCartItems(cartData)

        const authToken = token || localStorage.getItem('token')

        if(authToken) {
            try {
                await axios.post(`${backendUrl}/api/cart/add`, {
                    itemId,
                    size
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
        for(const items in cartItems) {
            for(const item in cartItems[items]) {
                try {
                    if(cartItems[items][item] > 0) { 
                        totalCount += cartItems[items][item]
                    }
                } catch(error) {
                    console.log(error)
                }
        
            }
        }
        return totalCount
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems)
        cartData[itemId][size] = quantity
        setCartItems(cartData)

        const authToken = token || localStorage.getItem('token')

        if(authToken) {
            try {
                await axios.post(`${backendUrl}/api/cart/update`, {
                    itemId,
                    size,
                    quantity
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
        for(const items in cartItems)  {
            let itemInfo = products.find((product) => product._id === items)
            for(const item in cartItems[items]) {
                try {
                    if(cartItems[items][item] > 0) { 
                        totalAmount += cartItems[items][item] * itemInfo.price
                    }
                } catch(error) {
                    console.log(error)
                }
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

            const loadCart = setTimeout(() => {
                getUserCart(token)
            }, 0)

            return () => clearTimeout(loadCart)
        }
    }, [token, getUserCart])

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
        setToken


    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider