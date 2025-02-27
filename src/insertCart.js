import mongoose from 'mongoose';
import cartsModel from './models/carts.model.js';
import productsModel from './models/products.model.js';

const connectMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/pizzeria?retryWrites=true&w=majority');
        console.log("Conectado con éxito a MongoDB usando Mongoose.");

        // Crear un producto de ejemplo
        const product = new productsModel({
            name: 'Producto de ejemplo',
            price: 100,
            description: 'Descripción del producto de ejemplo',
            category: 'Categoría de ejemplo',
            stock: 10,
            image: 'imagen.jpg'
        });
        await product.save();

        // Crear un carrito con el producto de ejemplo
        const cart = new cartsModel({
            products: [
                {
                    product: product._id,
                    quantity: 2
                }
            ]
        });
        await cart.save();

        console.log("Carrito insertado con éxito:", cart);
        mongoose.connection.close();
    } catch (error) {
        console.error("Error al insertar carrito:", error);
        mongoose.connection.close();
    }
};

connectMongoDB();