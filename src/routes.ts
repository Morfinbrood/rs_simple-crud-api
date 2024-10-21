import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './database';  // Import the async functions
import { validate as isValidUUID } from 'uuid';

export const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const { pathname } = parse(req.url || '', true);
    res.setHeader('Content-Type', 'application/json');

    try {

        // GET Default route '/'
        if (req.method === 'GET' && pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello on server!!!');
            return;
        }

        // GET all users
        if (req.method === 'GET' && pathname === '/api/users') {
            const users = await getAllUsers();
            res.writeHead(200);
            res.end(JSON.stringify(users));
            return;
        }

        // GET user by id
        if (req.method === 'GET' && pathname?.startsWith('/api/users/')) {
            const userId = pathname.split('/').pop();
            if (!isValidUUID(userId || '')) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid userId format.' }));
                return;
            }
            const user = await getUserById(userId!);
            if (!user) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'User not found.' }));
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(user));
            }
            return;
        }

        // POST a new user
        if (req.method === 'POST' && pathname === '/api/users') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const { username, age, hobbies } = JSON.parse(body);
                if (!username || age === undefined || !hobbies) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Missing required fields.' }));
                    return;
                }
                const newUser = await createUser(username, age, hobbies);  // await the async function
                res.writeHead(201);
                res.end(JSON.stringify(newUser));
            });
            return;
        }

        // PUT to update user by id
        if (req.method === 'PUT' && pathname?.startsWith('/api/users/')) {
            const userId = pathname.split('/').pop();
            if (!isValidUUID(userId || '')) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid userId format.' }));
                return;
            }
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const { username, age, hobbies } = JSON.parse(body);
                const updatedUser = await updateUser(userId!, username, age, hobbies);  // await the async function
                if (!updatedUser) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ message: 'User not found.' }));
                } else {
                    res.writeHead(200);
                    res.end(JSON.stringify(updatedUser));
                }
            });
            return;
        }

        // DELETE user by id
        if (req.method === 'DELETE' && pathname?.startsWith('/api/users/')) {
            const userId = pathname.split('/').pop();
            if (!isValidUUID(userId || '')) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid userId format.' }));
                return;
            }
            const deleted = await deleteUser(userId!);  // await the async function
            if (!deleted) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'User not found.' }));
            } else {
                res.writeHead(204);
                res.end();
            }
            return;
        }

        // Handle non-existent routes
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Endpoint not found.' }));

    } catch (error) {
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({ message: 'Internal server error.' }));
    }
};
