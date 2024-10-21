import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { createServer } from './server';

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

export const numCPUs = os.cpus().length - 1;
const PORT = parseInt(process.env.PORT || '4000', 10);
const WORKER_COUNT = numCPUs;

let users: User[] = [];

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    let currentWorkerIndex = 0;

    const workerPorts: number[] = [];

    for (let i = 0; i < WORKER_COUNT; i++) {
        const worker = cluster.fork();
        const workerPort = PORT + i + 1;
        workerPorts.push(workerPort);
        worker.send({ port: workerPort });
        console.log(`Worker ${worker.process.pid} is listening on port ${workerPort}`);

        worker.on('message', (message) => {
            if (message.type === 'updateUser') {
                users.push(message.user);

                for (const id in cluster.workers) {
                    cluster.workers?.[id]?.send({ type: 'syncUsers', data: users });
                }
            }
            if (message.type === 'deleteUser') {
                users = users.filter(user => user.id !== message.userId);

                for (const id in cluster.workers) {
                    cluster.workers?.[id]?.send({ type: 'syncUsers', data: users });
                }
            }
        });
    }

    (async () => {
        const loadBalancer = await createServer(PORT);
        console.log(`Load balancer is running on port ${PORT}`);

        loadBalancer.on('request', (req, res) => {
            const targetPort = workerPorts[currentWorkerIndex];
            const workerIndex = currentWorkerIndex;
            currentWorkerIndex = (currentWorkerIndex + 1) % WORKER_COUNT;

            console.log(`Request received: ${req.method} ${req.url}`);

            const proxy = http.request({
                hostname: 'localhost',
                port: targetPort,
                path: req.url,
                method: req.method,
                headers: req.headers,
            }, (proxyRes) => {
                if (!res.headersSent) {
                    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
                }
                proxyRes.pipe(res, { end: true });
            });

            req.pipe(proxy, { end: true });

            proxy.on('error', (err) => {
                console.error('Proxy error:', err);
                if (!res.headersSent) {
                    res.writeHead(502);
                }
                res.end('Bad Gateway');
            });

            proxy.on('response', () => {
                console.log(`Response successfully proxied from worker on port: ${targetPort} (Worker ${workerIndex + 1})`);
            });
        });
    })();
} else {
    process.on('message', async (message: { port?: number, type?: string, data?: User[] }) => {
        if (message.port) {
            const { port } = message;
            await createServer(port);
        }

        if (message.type === 'syncUsers' && message.data) {
            users = message.data;
        }
    });

    process.on('newUser', (user: User) => {
        process.send?.({ type: 'updateUser', user });
    });

    process.on('deleteUser', (userId: string) => {
        process.send?.({ type: 'deleteUser', userId });
    });
}
