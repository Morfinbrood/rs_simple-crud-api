import cluster from 'cluster';
import os from 'os';
import { startLoadBalancer } from './services/loadBalancer';
import { initializeWorkers } from './services/workerManager';
import { handleMessages } from './services/messageHandler';

const PORT = parseInt(process.env.PORT || '4000', 10);
const WORKER_COUNT = os.cpus().length - 1;

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    const workerPorts = initializeWorkers(WORKER_COUNT, PORT);

    (async () => {
        await startLoadBalancer(PORT, workerPorts);
    })();
} else {
    handleMessages();
}
