import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: (v) => v.length <= 5,
            message: 'Maximum 5 images allowed per review',
        },
    },
    verifiedPurchase: {
        type: Boolean,
        default: false,
    },
    helpful: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user',
        default: [],
    },
}, {
    timestamps: true,
});

// Ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
