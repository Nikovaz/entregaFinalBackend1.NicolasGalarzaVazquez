import mongoose from 'mongoose';
import productsModel from './products.model.js'; // Importar el modelo de productos

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number
        }
    ]
});

const cartsModel = mongoose.model('Cart', cartSchema);

export default cartsModel;