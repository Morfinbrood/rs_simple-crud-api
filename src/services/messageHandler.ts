import cluster from 'cluster';
import { createServer } from '../server';

let users: { id: string; username: string; age: number; hobbies: string[] }[] = [];

export const handleWorkerMessage = (message: any) => {
    if (message.type === 'updateUser') {
        console.log(`Worker ${process.pid}: Received updateUser message. Updating user list.`);
        users.push(message.user);
        syncUsersAcrossWorkers();
    }

    if (message.type === 'deleteUser') {
        console.log(`Worker ${process.pid}: Received deleteUser message. Removing user with ID: ${message.userId}.`);
        users = users.filter(user => user.id !== message.userId);
        syncUsersAcrossWorkers();
    }
};

export const handleMessages = () => {
    process.on('message', async (message: { port?: number, type?: string, data?: typeof users }) => {
        if (message.port) {
            const { port } = message;
            console.log(`Worker ${process.pid}: Starting server on port ${port}.`);
            await createServer(port, true);
        }

        if (message.type === 'syncUsers' && message.data) {
            console.log(`Worker ${process.pid}: Synchronizing users across workers.`);
            users = message.data;
        }
    });
};

const syncUsersAcrossWorkers = () => {
    console.log(`Worker ${process.pid}: Synchronizing users across workers.`);
    for (const id in cluster.workers) {
        cluster.workers?.[id]?.send({ type: 'syncUsers', data: users });
    }
};
