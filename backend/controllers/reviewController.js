import mongoose from 'mongoose';
import reviewModel from '../models/reviewModel.js';
import productModel from '../models/productsModel.js';
import orderModel from '../models/orderModel.js';

// Helper: recalculate product rating stats
const updateProductRatingStats = async (productId) => {
    const reviews = await reviewModel.find({ productId });
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
        await productModel.findByIdAndUpdate(productId, {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
        return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    for (const review of reviews) {
        sum += review.rating;
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    }

    await productModel.findByIdAndUpdate(productId, {
        averageRating: Math.round((sum / totalReviews) * 10) / 10,
        totalReviews,
        ratingDistribution: distribution,
    });
};

// Helper: check if user has purchased the product
const hasUserPurchased = async (userId, productId) => {
    const order = await orderModel.findOne({
        userId,
        status: 'Delivered',
        'items._id': productId,
    });
    return !!order;
};

// POST /api/reviews — Add a new review
export const addReview = async (req, res) => {
    try {
        const { userId } = req.body;
        const { productId, rating, title, comment, images } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({ success: false, message: 'productId and rating are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Check for existing review
        const existing = await reviewModel.findOne({ productId, userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }

        const verifiedPurchase = await hasUserPurchased(userId, productId);

        const review = new reviewModel({
            productId,
            userId,
            rating: Math.round(rating),
            title: (title || '').trim().slice(0, 100),
            comment: (comment || '').trim().slice(0, 1000),
            images: Array.isArray(images) ? images.slice(0, 5) : [],
            verifiedPurchase,
        });

        await review.save();
        await updateProductRatingStats(productId);

        res.status(201).json({ success: true, message: 'Review added successfully', review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/reviews/:productId — Get paginated reviews
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const sort = req.query.sort || 'recent';

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        let sortQuery = { createdAt: -1 };
        switch (sort) {
            case 'helpful':
                sortQuery = { helpful: -1, createdAt: -1 };
                break;
            case 'highest':
                sortQuery = { rating: -1, createdAt: -1 };
                break;
            case 'lowest':
                sortQuery = { rating: 1, createdAt: -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }

        const filter = { productId };
        const ratingFilter = req.query.rating;
        if (ratingFilter) {
            const ratings = ratingFilter.split(',').map(Number).filter((n) => n >= 1 && n <= 5);
            if (ratings.length > 0) {
                filter.rating = { $in: ratings };
            }
        }

        if (req.query.withPhotos === 'true') {
            filter.images = { $exists: true, $not: { $size: 0 } };
        }

        const total = await reviewModel.countDocuments(filter);
        const reviews = await reviewModel
            .find(filter)
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'name')
            .lean();

        // Get product rating stats
        const product = await productModel.findById(productId).select('averageRating totalReviews ratingDistribution').lean();

        res.json({
            success: true,
            reviews: reviews.map((r) => ({
                ...r,
                userName: r.userId?.name || 'Anonymous',
                userId: r.userId?._id || r.userId,
                helpfulCount: r.helpful?.length || 0,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            stats: {
                averageRating: product?.averageRating || 0,
                totalReviews: product?.totalReviews || 0,
                ratingDistribution: product?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/reviews/:id — Edit own review
export const editReview = async (req, res) => {
    try {
        const { userId } = req.body;
        const reviewId = req.params.id;

        const review = await reviewModel.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (req.body.rating) review.rating = Math.min(5, Math.max(1, Math.round(req.body.rating)));
        if (req.body.title !== undefined) review.title = (req.body.title || '').trim().slice(0, 100);
        if (req.body.comment !== undefined) review.comment = (req.body.comment || '').trim().slice(0, 1000);
        if (Array.isArray(req.body.images)) review.images = req.body.images.slice(0, 5);

        await review.save();
        await updateProductRatingStats(review.productId);

        res.json({ success: true, message: 'Review updated', review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/reviews/:id — Delete own review
export const deleteReview = async (req, res) => {
    try {
        const { userId } = req.body;
        const reviewId = req.params.id;

        const review = await reviewModel.findOneAndDelete({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        await updateProductRatingStats(review.productId);

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/reviews/:id/helpful — Toggle helpful
export const toggleHelpful = async (req, res) => {
    try {
        const { userId } = req.body;
        const reviewId = req.params.id;

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const index = review.helpful.findIndex((id) => id.equals(userObjectId));

        if (index === -1) {
            review.helpful.push(userObjectId);
        } else {
            review.helpful.splice(index, 1);
        }

        await review.save();

        res.json({
            success: true,
            message: index === -1 ? 'Marked as helpful' : 'Removed helpful vote',
            helpfulCount: review.helpful.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
