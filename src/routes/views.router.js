import express from 'express';
import productsModel from '../models/products.model.js';
import cartsModel from '../models/carts.model.js';

const router = express.Router();

// Ruta para visualizar todos los productos con paginación
router.get('/', async (req, res) => {
    try {
        const { query, limit, sort, page } = req.query;
        const options = {
            limit: parseInt(limit) || 10,
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
            page: parseInt(page) || 1
        };
        const filter = query ? { name: new RegExp(query, 'i') } : {};
        const products = await productsModel.paginate(filter, options);

        const prevLink = products.hasPrevPage ? `/?page=${products.prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null;
        const nextLink = products.hasNextPage ? `/?page=${products.nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null;

        res.render('home', {
            products: products.docs,
            query,
            limit: options.limit,
            sort,
            currentPage: products.page,
            totalPages: products.totalPages,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            prevLink,
            nextLink
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los productos' });
    }
});

// Ruta para visualizar un producto específico
router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productsModel.findById(pid).lean();
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        res.render('product', { product });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).send('Error al obtener producto');
    }
});

// Ruta para visualizar un carrito específico
router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartsModel.findById(cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        res.render('cart', { cart });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).send('Error al obtener carrito');
    }
});

// Ruta para actualizar un carrito específico
router.put('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const cart = await cartsModel.findByIdAndUpdate(cid, { products }, { new: true }).populate('products.product').lean();
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error al actualizar carrito:', error);
        res.status(500).send('Error al actualizar carrito');
    }
});

// Ruta para eliminar un carrito específico
router.delete('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartsModel.findByIdAndDelete(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        res.status(200).send('Carrito eliminado');
    } catch (error) {
        console.error('Error al eliminar carrito:', error);
        res.status(500).send('Error al eliminar carrito');
    }
});

export default router;