import express from 'express';
import cartsModel from '../models/carts.model.js';
import productsModel from '../models/products.model.js';

const router = express.Router();

// DELETE api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        cart.products = cart.products.filter(product => product.product.toString() !== pid);
        await cart.save();
        res.json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito' });
    }
});

// PUT api/carts/:cid
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    try {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        cart.products = products;
        await cart.save();
        res.json({ status: 'success', message: 'Carrito actualizado' });
    } catch (error) {
        console.error('Error al actualizar carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar carrito' });
    }
});

// PUT api/carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        const product = cart.products.find(product => product.product.toString() === pid);
        if (product) {
            product.quantity = quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }
        await cart.save();
        res.json({ status: 'success', message: 'Cantidad de producto actualizada' });
    } catch (error) {
        console.error('Error al actualizar cantidad de producto:', error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar cantidad de producto' });
    }
});

// DELETE api/carts/:cid
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        cart.products = [];
        await cart.save();
        res.json({ status: 'success', message: 'Todos los productos eliminados del carrito' });
    } catch (error) {
        console.error('Error al eliminar todos los productos del carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar todos los productos del carrito' });
    }
});

// GET api/carts/:cid
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartsModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener carrito' });
    }
});

export default router;