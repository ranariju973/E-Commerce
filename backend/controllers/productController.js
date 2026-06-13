import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productsModel.js';
import {
    PRODUCT_TAXONOMY,
    isValidCategory,
    isValidCategorySubCategoryPair
} from '../config/productTaxonomy.js';

const resolveBestSellerValue = (isBestSeller, bestseller) => (
    isBestSeller === true ||
    isBestSeller === 'true' ||
    bestseller === true ||
    bestseller === 'true'
);

//function for add product
const addProduct = async (req, res) => {
    try {

        const name = `${req.body?.name || ''}`.trim();
        const description = `${req.body?.description || ''}`.trim();
        const category = `${req.body?.category || ''}`.trim();
        const rawSubCategory = req.body?.subCategory || req.body?.subcategory;
        const resolvedSubCategory = `${rawSubCategory || ''}`.trim();
        const priceValue = Number(req.body?.price);

        if (!name || !description) {
            return res.status(400).json({ success: false, message: 'name and description are required' });
        }

        if (!category) {
            return res.status(400).json({ success: false, message: 'category is required' });
        }

        if (!resolvedSubCategory) {
            return res.status(400).json({ success: false, message: 'subCategory is required' });
        }

        if (!Number.isFinite(priceValue) || priceValue <= 0) {
            return res.status(400).json({ success: false, message: 'price must be a valid number greater than 0' });
        }

        if (!isValidCategory(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Allowed categories: ${Object.keys(PRODUCT_TAXONOMY).join(', ')}`
            });
        }

        if (!isValidCategorySubCategoryPair(category, resolvedSubCategory)) {
            return res.status(400).json({
                success: false,
                message: `Invalid subCategory for ${category}. Allowed values: ${(PRODUCT_TAXONOMY[category] || []).join(', ')}`
            });
        }

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter(Boolean);

        if (images.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one product image is required' });
        }

        if (!images.every((item) => item.mimetype?.startsWith('image/'))) {
            return res.status(400).json({ success: false, message: 'Only image files are allowed' });
        }

        const imageUrls = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        const productData = {
            name,
            description,
            price: priceValue,
            category,
            subCategory: resolvedSubCategory,
            bestseller: resolveBestSellerValue(req.body?.isBestSeller, req.body?.bestseller),
            image: imageUrls,
            date: Date.now()
        };

        const product = new productModel(productData);
        await product.save();

        res.status(201).json({ success: true, message: 'Product added successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//function for list products
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({})

        res.json({ success: true, products });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//function for remove product
const removeProduct = async (req, res) => {
    try {

        const productId = req.body?.id || req.params?.id;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product id is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }

        const deletedProduct = await productModel.findByIdAndDelete(productId)

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({success:true, message:"product removed"})
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//function for single product details
const singleProduct = async (req, res) => {

    try {
        
        const productId = req.params?.id || req.body?.productId;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product id is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}

//function for update product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params?.id || req.body?.id;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product id is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product id' });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const updateData = {};

        if (req.body.name !== undefined) {
            const name = `${req.body.name}`.trim();
            if (!name) return res.status(400).json({ success: false, message: 'Name cannot be empty' });
            updateData.name = name;
        }

        if (req.body.description !== undefined) {
            const description = `${req.body.description}`.trim();
            if (!description) return res.status(400).json({ success: false, message: 'Description cannot be empty' });
            updateData.description = description;
        }

        if (req.body.price !== undefined) {
            const priceValue = Number(req.body.price);
            if (!Number.isFinite(priceValue) || priceValue <= 0) {
                return res.status(400).json({ success: false, message: 'Price must be a valid number greater than 0' });
            }
            updateData.price = priceValue;
        }

        if (req.body.category !== undefined) {
            const category = `${req.body.category}`.trim();
            if (!isValidCategory(category)) {
                return res.status(400).json({ success: false, message: `Invalid category` });
            }
            updateData.category = category;

            // If category changed, validate subCategory too
            const subCategory = req.body.subCategory !== undefined
                ? `${req.body.subCategory}`.trim()
                : product.subCategory;

            if (!isValidCategorySubCategoryPair(category, subCategory)) {
                return res.status(400).json({ success: false, message: `Invalid subCategory for ${category}` });
            }
            updateData.subCategory = subCategory;
        } else if (req.body.subCategory !== undefined) {
            const subCategory = `${req.body.subCategory}`.trim();
            if (!isValidCategorySubCategoryPair(product.category, subCategory)) {
                return res.status(400).json({ success: false, message: `Invalid subCategory` });
            }
            updateData.subCategory = subCategory;
        }

        if (req.body.bestseller !== undefined) {
            updateData.bestseller = resolveBestSellerValue(req.body.bestseller, req.body.bestseller);
        }

        // Process new images if any
        if (req.files) {
            const image1 = req.files.image1 && req.files.image1[0];
            const image2 = req.files.image2 && req.files.image2[0];
            const image3 = req.files.image3 && req.files.image3[0];
            const image4 = req.files.image4 && req.files.image4[0];

            const images = [image1, image2, image3, image4].filter(Boolean);

            if (images.length > 0) {
                if (!images.every((item) => item.mimetype?.startsWith('image/'))) {
                    return res.status(400).json({ success: false, message: 'Only image files are allowed' });
                }

                const imageUrls = await Promise.all(
                    images.map(async (item) => {
                        const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                        return result.secure_url;
                    })
                );

                // If images are uploaded, we replace the old ones or append?
                // For simplicity, let's replace the existing images with the new ones.
                updateData.image = imageUrls;
            }
        }

        await productModel.findByIdAndUpdate(productId, updateData);

        res.json({ success: true, message: 'Product updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { addProduct, listProducts, removeProduct, singleProduct, updateProduct };