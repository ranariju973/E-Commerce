import mongoose from "mongoose";
import { PRODUCT_CATEGORIES, PRODUCT_SUB_CATEGORIES } from "../config/productTaxonomy.js";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: PRODUCT_CATEGORIES,
    },
    subCategory: {
        type: String,
        required: true,
        trim: true,
        enum: PRODUCT_SUB_CATEGORIES,
    },
    bestseller: {
        type: Boolean
    },
    date: {
        type: Number,
        required: true,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    ratingDistribution: {
        type: Object,
        default: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
})

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;