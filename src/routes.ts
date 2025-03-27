import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './services/userService';
import { validateUUID, validateUserData } from './validators';
import { parseRequestBody } from './utils';

export const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const { pathname } = parse(req.url || '', true);
    res.setHeader('Content-Type', 'application/json');

    try {
        // Получаем идентификатор воркера
        const workerId = process.pid; // Идентификатор воркера

        // GET '/'
        if (req.method === 'GET' && pathname === '/') {
            console.log(`Worker ${workerId} handling route: GET /`);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello on server!!!');
            return;
        }

        // GET all users
        if (req.method === 'GET' && pathname === '/api/users') {
            console.log(`Worker ${workerId} handling route: GET /api/users`);
            const users = await getAllUsers();
            res.writeHead(200);
            res.end(JSON.stringify(users));
            return;
        }

        // GET user by id
        if (req.method === 'GET' && pathname?.startsWith('/api/users/')) {
            console.log(`Worker ${workerId} handling route: GET /api/users/:id`);
            const userId = pathname.split('/').pop();
            if (!validateUUID(userId)) {
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
            console.log(`Worker ${workerId} handling route: POST /api/users`);
            try {
                const body = await parseRequestBody(req);
                if (!validateUserData(body)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Missing or invalid required fields. Expected: username (string), age (number), hobbies (array).' }));
                    return;
                }
                const newUser = await createUser(body.username, body.age, body.hobbies);
                res.writeHead(201);
                res.end(JSON.stringify(newUser));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid JSON format or missing required fields.' }));
            }
            return;
        }

        // PUT to update user by id
        if (req.method === 'PUT' && pathname?.startsWith('/api/users/')) {
            console.log(`Worker ${workerId} handling route: PUT /api/users/:id`);
            const userId = pathname.split('/').pop();
            if (!validateUUID(userId)) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid userId format.' }));
                return;
            }
            try {
                const body = await parseRequestBody(req);
                const updatedUser = await updateUser(userId!, body.username, body.age, body.hobbies);
                if (!updatedUser) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ message: 'User not found.' }));
                } else {
                    res.writeHead(201);
                    res.end(JSON.stringify(updatedUser));
                }
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Error handling PUT user by Id.' }));
            }
            return;
        }

        // DELETE user by id
        if (req.method === 'DELETE' && pathname?.startsWith('/api/users/')) {
            console.log(`Worker ${workerId} handling route: DELETE /api/users/:id`);
            const userId = pathname.split('/').pop();
            if (!validateUUID(userId)) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid userId format.' }));
                return;
            }
            const deletedUser = await deleteUser(userId!);
            if (!deletedUser) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'User not found.' }));
            } else {
                res.writeHead(204);
                res.end();
            }
            return;
        }

        // Handle non-existent routes
        console.log(`Worker ${workerId} handling route: 404 - Not Found`);
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Endpoint not found.' }));

    } catch (error) {
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({ message: 'Internal server error.' }));
    }
};
