import mongoose from 'mongoose';

const collectionName = 'carts';

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
            quantity: Number
        }
    ]
});

const cartsModel = mongoose.model(collectionName, cartSchema);
export default cartsModel;