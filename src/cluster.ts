import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { createServer, stopServer } from './server'; // Используем ваши функции создания и остановки сервера
import { availableParallelism } from 'node:os';

export const numCPUs = availableParallelism() - 1;
const PORT = parseInt(process.env.PORT || '4000', 10);
const WORKER_COUNT = os.cpus().length - 1; // Количество доступных ядер - 1

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    let currentWorkerIndex = 0;

    // Массив портов для рабочих процессов
    const workerPorts: number[] = [];

    // Запуск рабочих процессов
    for (let i = 0; i < WORKER_COUNT; i++) {
        const worker = cluster.fork();
        const workerPort = PORT + i + 1;
        workerPorts.push(workerPort);
        worker.send({ port: workerPort });
        console.log(`Worker ${worker.process.pid} is listening on port ${workerPort}`);
    }

    // Обернем асинхронную логику в функцию
    (async () => {
        // Балансировщик нагрузки, слушает на порту PORT
        console.log(`start balancer `)
        const loadBalancer = await createServer(PORT);

        loadBalancer.on('request', (req, res) => {
            // Реализуем алгоритм round-robin
            const targetPort = workerPorts[currentWorkerIndex];
            currentWorkerIndex = (currentWorkerIndex + 1) % WORKER_COUNT;

            // Перенаправляем запрос на следующий рабочий процесс
            const proxy = http.request({
                hostname: 'localhost',
                port: targetPort,
                path: req.url,
                method: req.method,
                headers: req.headers,
            }, (proxyRes) => {
                if (proxyRes.statusCode !== undefined) {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                } else {
                    res.writeHead(502); // Если статус не определён, возвращаем 502
                }
                proxyRes.pipe(res, { end: true });
            });

            req.pipe(proxy, { end: true });

            proxy.on('error', (err) => {
                console.error('Proxy error:', err);
                res.writeHead(502);
                res.end('Bad Gateway');
            });
        });
    })();

    // // Если рабочий процесс завершился, перезапускаем его
    // cluster.on('exit', (worker) => {
    //     console.log(`Worker ${worker.process.pid} died`);
    //     const newWorker = cluster.fork();
    //     const workerPort = workerPorts.pop() || PORT + WORKER_COUNT; // Определяем новый порт
    //     workerPorts.push(workerPort);
    //     newWorker.send({ port: workerPort });
    //     console.log(`New worker ${newWorker.process.pid} is listening on port ${workerPort}`);
    // });

} else {
    // Каждый рабочий процесс получает порт через сообщение от мастера
    process.on('message', async (message: { port: number }) => {
        const { port } = message;
        await createServer(port); // Запускаем сервер на указанном порту
    });
}

