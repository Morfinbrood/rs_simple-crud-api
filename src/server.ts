import http from 'http';
import dotenv from 'dotenv';
import { handleRequest } from './routes';

dotenv.config();

let server: http.Server | null = null;

export const createServer = async (port?: number, isWorker = false) => {
    if (!port) {
        port = parseInt(process.env.PORT || '4000', 10);
    }

    server = http.createServer((req, res) => {
        if (isWorker && req.headers['x-load-balancer'] !== 'true') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Direct access to worker is forbidden.' }));
            return;
        }
        handleRequest(req, res);
    });

    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

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
