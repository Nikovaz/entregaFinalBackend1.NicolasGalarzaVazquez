import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import viewsRouter from './routes/views.router.js';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 9090; 

// Preparar la configuración del servidor para recibir objetos JSON.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Carpeta public
app.use(express.static(__dirname + '/public'));

// Ruta
app.use('/', viewsRouter);

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor ecorriente en http://localhost:${PORT}`);
});

// Crear instancia de socket
const socketServer = new Server(httpServer);

const productsFilePath = path.join(__dirname, '../db/products.json');

const readProductsFromFile = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

const writeProductsToFile = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

let products = readProductsFromFile();

socketServer.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.emit('productList', products);

    socket.on('addProduct', (product) => {
        console.log("Producto agregado", product);
        products.push(product);
        writeProductsToFile(products);
        socketServer.emit('productAdded', product);
    });

    socket.on('deleteProduct', (productId) => {
        const index = products.findIndex((p) => p.id === productId);
        if (index !== -1) {
            const [deletedProduct] = products.splice(index, 1);
            writeProductsToFile(products);
            socketServer.emit('productDeleted', deletedProduct);
        }
    });

    socket.on('disconnect', () => {
        console.log("Cliente desconectado");
    });
});