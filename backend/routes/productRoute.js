import express from "express";
import { addProduct, listProducts, removeProduct, singleProduct } from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

//route for add product
productRouter.post('/add',adminAuth, upload.fields([
    {name: 'image1', maxCount: 1}, 
    {name: 'image2', maxCount: 1}, 
    {name: 'image3', maxCount: 1}, 
    {name: 'image4', maxCount: 1}
]), addProduct);

//route for list products
productRouter.get('/list', listProducts);

//route for remove product
productRouter.post('/remove',adminAuth, removeProduct);
productRouter.delete('/remove/:id',adminAuth, removeProduct);

//route for single product details
productRouter.get('/:id', singleProduct);

export default productRouter;