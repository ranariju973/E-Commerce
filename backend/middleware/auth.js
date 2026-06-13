import jwt from 'jsonwebtoken'

const authUser = async (req,res, next) => {
    const {token} = req.headers
    if(!token) {
        return res.status(401).json({success: false, message: 'Not authorized'})
    }

    try {
        console.log("Verifying token. JWT_SECRET:", process.env.JWT_SECRET ? "exists" : "MISSING!");
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({success: false, code: 'TOKEN_EXPIRED', message: 'Token expired'})
        }

        console.log("Token verification error:", error.message)

        return res.status(401).json({success: false, code: 'TOKEN_INVALID', message: 'Invalid token'})
    }
}

export default authUser
