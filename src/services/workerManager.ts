import cluster from 'cluster';
import { handleWorkerMessage } from '../services/messageHandler'; 

export const initializeWorkers = (workerCount: number, basePort: number): number[] => {
    const workerPorts: number[] = [];

    for (let i = 0; i < workerCount; i++) {
        const worker = cluster.fork();
        const workerPort = basePort + i + 1;
        workerPorts.push(workerPort);

        worker.send({ port: workerPort });
        console.log(`Worker ${worker.process.pid} is listening on port ${workerPort}`);

        worker.on('message', (message) => handleWorkerMessage(message));
    }

    return workerPorts;
};
