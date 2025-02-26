import express from 'express';
import cartsModel from '../models/carts.model.js';
import productsModel from '../models/products.model.js';

const router = express.Router();

// Ruta para agregar un producto al carrito
router.post('/addProduct', async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;
        const cart = await cartsModel.findById(cartId);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        const product = await productsModel.findById(productId);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        const existingProductIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (existingProductIndex >= 0) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }
        await cart.save();
        res.status(200).send('Producto agregado al carrito');
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).send('Error al agregar producto al carrito');
    }
});

// Ruta para eliminar un producto del carrito
router.post('/removeProduct', async (req, res) => {
    try {
        const { cartId, productId } = req.body;
        const cart = await cartsModel.findById(cartId);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();
        res.status(200).send('Producto eliminado del carrito');
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).send('Error al eliminar producto del carrito');
    }
});

export default router;