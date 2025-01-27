import fs from 'fs/promises';
import path from 'path';

const pathCarts = path.resolve('db', 'carts.json');

export default class CartManager {
    constructor() {
        this.carts = [];
        this.init();
    }

    // Inicializa los carritos desde el archivo
    async init() {
        try {
            const data = await fs.readFile(pathCarts, 'utf8');
            this.carts = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error al leer el archivo de carritos:", error);
            this.carts = [];
        }
    }

    // Guarda los carritos en el archivo
    async saveToFile() {
        try {
            await fs.writeFile(pathCarts, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            console.error("Error al guardar el archivo de carritos:", error);
        }
    }

    // Crea un nuevo carrito
    async createCart() {
        const newCart = {
            id: this.carts.length ? this.carts[this.carts.length - 1].id + 1 : 1,
            products: []
        };
        this.carts.push(newCart);
        await this.saveToFile();
        return newCart.id;
    }

    // Obtiene un carrito por su ID
    async getCartById(id) {
        return this.carts.find(cart => cart.id === id);
    }

    // Agrega un producto a un carrito
    async addProductToCart(cartId, productId) {
        const cart = await this.getCartById(cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ id: productId, quantity: 1 });
        }

        await this.saveToFile();
        return cart;
    }
}