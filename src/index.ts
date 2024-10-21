import http from 'http';
import dotenv from 'dotenv';
import { handleRequest } from './routes';
import { initDatabase } from './database';

dotenv.config();

const port = parseInt(process.env.PORT || '4000', 10);

const server = http.createServer(handleRequest);

initDatabase().then(() => {
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Error initializing the database:', err);
    process.exit(1);
});
