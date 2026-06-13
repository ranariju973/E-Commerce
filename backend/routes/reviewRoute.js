import express from 'express';
import authUser from '../middleware/auth.js';
import {
    addReview,
    getProductReviews,
    editReview,
    deleteReview,
    toggleHelpful,
} from '../controllers/reviewController.js';

const reviewRouter = express.Router();

// Public
reviewRouter.get('/:productId', getProductReviews);

// Authenticated
reviewRouter.post('/', authUser, addReview);
reviewRouter.put('/:id', authUser, editReview);
reviewRouter.delete('/:id', authUser, deleteReview);
reviewRouter.post('/:id/helpful', authUser, toggleHelpful);

export default reviewRouter;
