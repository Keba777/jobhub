import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import sequelize from './config/db';
import app from './app';

dotenv.config({
    path: path.join(__dirname, "../.env")
});

async function start() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
    } catch (err) {
        console.error('Unable to connect to DB:', err);
        process.exit(1);
    }

    const server = http.createServer(app);

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

start();