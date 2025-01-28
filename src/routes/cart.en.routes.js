import { Router } from 'express';
import CartManager from '../service/CartManager.js';

const router = Router();
const cartManager = new CartManager();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCartId = await cartManager.createCart();
        res.status(201).json({ status: "Success", id: newCartId, message: 'Carrito creado correctamente' });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al crear el carrito" });
    }
});

// Listar productos de un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await cartManager.getCartById(cartId);
        if (cart) {
            res.status(200).json({ status: "Success", payload: cart.products });
        } else {
            res.status(404).json({ status: "Error", message: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al obtener el carrito" });
    }
});

// Agregar producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        const updatedCart = await cartManager.addProductToCart(cartId, productId);
        if (updatedCart) {
            res.status(200).json({ status: "Success", payload: updatedCart });
        } else {
            res.status(404).json({ status: "Error", message: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ status: "Error", message: "Error al agregar el producto al carrito" });
    }
});

export default router;