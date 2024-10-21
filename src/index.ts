import http from 'http';
import dotenv from 'dotenv';
import { handleRequest } from './routes';

dotenv.config();

const port = parseInt(process.env.PORT || '4000', 10);
let server: http.Server | null = null;

export const createServer = async () => {
    if (!server) {
        server = http.createServer(handleRequest);
        server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }
    return server;
};

export const stopServer = async () => {
    return new Promise<void>((resolve, reject) => {
        if (server) {
            server.close((err) => {
                if (err) {
                    console.error('Error while stopping the server:', err);
                    reject(err);
                } else {
                    console.log('Server stopped.');
                    resolve();
                }
            });
        } else {
            console.error('Server is not running.');
            resolve();
        }
    });
};

createServer().catch(err => {
    console.error('createServer initialization error:', err);
    process.exit(1);
});
