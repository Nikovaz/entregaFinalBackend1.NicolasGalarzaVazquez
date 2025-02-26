import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import viewsRouter from './routes/views.router.js';
import cartsRouter from './routes/carts.router.js'; // Importar el router de carritos
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import * as dataOrders from '../db/data.js';
import ordersModel from './models/orders.model.js';
import productsModel from './models/products.model.js'; // Importar el modelo de productos

const app = express();
const PORT = process.env.PORT || 9090; 

// Registrar el helper 'eq' en Handlebars
const hbs = handlebars.create({
    helpers: {
        eq: (a, b) => a === b
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

// Preparar la configuración del servidor para recibir objetos JSON.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de handlebars
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Carpeta public
app.use(express.static(__dirname + '/public'));

// Rutas
app.use('/', viewsRouter);
app.use('/api/carts', cartsRouter); // Usar el router de carritos

// Ruta para realtimeproducts (asegúrate de tener esta ruta definida)
app.get('/realtimeproducts', async (req, res) => {
    const products = await productsModel.find().lean();
    res.render('realTimeProducts', { products }); // Asegúrate de tener una vista llamada 'realTimeProducts.handlebars'
});

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Crear instancia de socket
const socketServer = new Server(httpServer);

socketServer.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('addProduct', async (product) => {
        console.log("Producto agregado", product);
        const newProduct = new productsModel(product);
        await newProduct.save();
        socketServer.emit('productAdded', newProduct.toObject());
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            if (!productId) {
                console.log('No se proporcionó un ID de producto');
                return;
            }
            // Busca el producto por su ID
            const product = await productsModel.findById(productId);
            if (!product) {
                console.log('No existe un producto con el ID:', productId);
                return;
            }
            // Elimina el producto
            const deletedProduct = await productsModel.findByIdAndDelete(productId);
            if (deletedProduct) {
                socketServer.emit('productDeleted', deletedProduct.toObject());
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log("Cliente desconectado");
    });
});

// Conectar a MongoDB usando Mongoose
const connectMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/pizzeria?retryWrites=true&w=majority');
        console.log("Conectado con éxito a MongoDB usando Mongoose.");

        // Limpiar la colección de órdenes
        await ordersModel.deleteMany({});

        // Insertar datos de órdenes en la base de datos
        await ordersModel.insertMany(dataOrders.default);

        // Listar información de la base de datos
        let orders = await ordersModel.find();
        console.log("Órdenes en la BD: ", orders);

        reportesFunc();

    } catch (error) {
        console.error("No se pudo conectar a la BD usando Mongoose: " + error);
        process.exit();
    }
};
connectMongoDB();

let reportesFunc = async () => {
    let orders = await ordersModel.aggregate([

        // Stage 1: Filtrar las órdenes por tamaño, en este caso solo pizzas medianas:
        {
            $match: { size: "medium" }
        },

        // Stage 2: Agrupar por sabores y acumular el número de ejemplares de cada sabor:
        {
            $group: { _id: "$name", totalQuantity: { $sum: "$quantity" } }
        },

        // Stage 3: Ordenar los documentos ya agrupados de mayor a menor.
        {
            $sort: { totalQuantity: -1 }
        },

        // Stage 4: Guardar todos los documentos generados de la agregación en un nuevo documento 
        //         dentro de un arreglo. Para no dejarlos sueltos en la colección.
        //         $push indica que se guarda en un array, y $$ROOT inserta todo el documento.
        {
            $group: { _id: 1, orders: { $push: "$$ROOT" } }
        },

        // Stage 5: Crear nuestro proyecto (documento) a partir del array de datos.
        {
            $project: {
                "_id": 0,
                orders: "$orders"
            }
        },

        // Stage FINAL (se crea una colección --> reportes_pizzas_2025)
        {
            $merge: { into: "reportes_pizzas_2025" }
        }

    ]);

    console.log("Resultados de la agregación:");
    console.log(orders);
};