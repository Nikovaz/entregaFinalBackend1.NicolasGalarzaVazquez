import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const collectionName = 'products';

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    stock: Number,
    image: String,
});

// Habilitar el plugin de paginación
productSchema.plugin(mongoosePaginate);

const productsModel = mongoose.model(collectionName, productSchema);
export default productsModel;