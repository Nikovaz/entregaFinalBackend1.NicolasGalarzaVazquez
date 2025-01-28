import { Router } from 'express';
import ProductManager from '../service/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// Lista todos los productos
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const products = await productManager.getAllProducts(limit);
        res.status(200).json({ status: "Success", payload: products });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al obtener los productos" });
    }
});

export default router;