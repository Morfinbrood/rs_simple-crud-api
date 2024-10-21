import http from 'http';
import { createServer } from '../server';

export const startLoadBalancer = async (port: number, workerPorts: number[]) => {
    const loadBalancer = await createServer(port);
    let currentWorkerIndex = 0;

    console.log(`Load balancer is running on port ${port}`);
    loadBalancer.on('request', (req, res) => {
        const targetPort = workerPorts[currentWorkerIndex];
        currentWorkerIndex = (currentWorkerIndex + 1) % workerPorts.length;

        console.log();
        console.log(`Load balancer: forwarding ${req.method} ${req.url} to worker on port ${targetPort}`);

        const proxy = http.request({
            hostname: 'localhost',
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: {
                ...req.headers,
                'x-load-balancer': 'true'
            },
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
    });

};
