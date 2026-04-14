import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productsModel.js';

//function for add product
const addProduct = async (req, res) => {
    try {

        const {
            name,
            description,
            price,
            category,
            subCategory,
            subcategory,
            sizes,
            bestseller,
            isBestSeller
        } = req.body;

        const resolvedSubCategory = subCategory || subcategory;
        const resolvedBestSeller = typeof isBestSeller !== 'undefined' ? isBestSeller : bestseller;

        if (!resolvedSubCategory) {
            return res.status(400).json({ success: false, message: 'subCategory is required' });
        }

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imageUrls = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type: "image"});
                return result.secure_url;
            })
        )

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory: resolvedSubCategory,
            sizes: JSON.parse(sizes),
            bestseller: resolvedBestSeller === "true" || resolvedBestSeller === true,
            image: imageUrls,
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product added successfully" })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
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

        const productId = req.body?.id || req.params.id;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product id is required" });
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
        
        const {productId} = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product id is required" });
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

export { addProduct, listProducts, removeProduct, singleProduct };