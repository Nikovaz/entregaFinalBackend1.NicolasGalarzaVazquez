import express from 'express';
import productRouter from './routes/products.router.js';
import cartRouter from './routes/cart.en.routes.js';

const app = express();

// Preparar la configuración del servidor para recibir objetos JSON.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

const SERVER_PORT = 9090;
app.listen(SERVER_PORT, () => {
    console.log(`Servidor escuchando por el puerto: ${SERVER_PORT}`);
    console.log(`URL para usar en Postman: http://localhost:${SERVER_PORT}/api/products`);
    console.log(`URL para usar en Postman: http://localhost:${SERVER_PORT}/api/carts`);
});

