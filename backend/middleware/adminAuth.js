import jwt from 'jsonwebtoken'

const adminAuth = async (req,res, next) => {
    try {
        const {token} = req.headers
        if(!token) {
            return res.status(401).json({success: false, message: 'No token provided'})
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        if(token_decode.role !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.status(403).json({success: false, message: 'Unauthorized'})
        }

        next()
    } catch (error) {
        return res.status(500).json({success: false, message:error.message})
    }
}

export default adminAuth