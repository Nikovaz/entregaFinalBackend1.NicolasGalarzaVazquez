import { Router } from 'express';
import ProductManager from '../service/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// APIS
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

// Buscar un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const product = await productManager.getProductById(productId);
        if (product) {
            res.status(200).json({ status: "Success", payload: product });
        } else {
            res.status(404).json({ status: "Error", message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al obtener el producto" });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ status: "Error", message: 'Todos los campos son obligatorios' });
        }
        const product = { title, description, code, price, stock, category, thumbnails };
        const newProductId = await productManager.addProduct(product);
        res.status(201).json({ status: "Success", id: newProductId, message: 'Producto creado correctamente' });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al crear el producto" });
    }
});

// Actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updatedProduct = await productManager.updateProduct(productId, req.body);
        if (updatedProduct) {
            res.status(200).json({ status: "Success", payload: updatedProduct });
        } else {
            res.status(404).json({ status: "Error", message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al actualizar el producto" });
    }
});

// Eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);
        if (deletedProduct) {
            res.status(200).json({ status: "Success", id: productId, message: 'Producto eliminado correctamente' });
        } else {
            res.status(404).json({ status: "Error", message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al eliminar el producto" });
    }
});

export default router;