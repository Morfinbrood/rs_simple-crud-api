import request from 'supertest';
import { createServer, stopServer } from '../src/index';

let server: any;

beforeAll(async () => {
    server = await createServer();
});

afterAll(async () => {
    await stopServer();
});

// this is integration tests
describe('User API', () => {
    let userId: string;
    const newUser = { username: 'John', age: 30, hobbies: ['reading', 'gaming'] };

    it('GET /api/users - should return an empty array', async () => {
        const response = await request(server).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('POST /api/users - should create a new user', async () => {
        const response = await request(server).post('/api/users').send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.username).toBe(newUser.username);
        expect(response.body.age).toBe(newUser.age);
        expect(response.body.hobbies).toEqual(newUser.hobbies);

        userId = response.body.id; // for next test
    });

    it('GET /api/users/:userId - should return user by Id', async () => {
        const response = await request(server).get(`/api/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(userId);
        expect(response.body.username).toBe(newUser.username);
        expect(response.body.age).toBe(newUser.age);
        expect(response.body.hobbies).toEqual(newUser.hobbies);
    });

    it('PUT /api/users/:userId - should update the user', async () => {

        const updateUserData = { username: 'Katia Updated', age: 45 };
        const response = await request(server).put(`/api/users/${userId}`).send(updateUserData);
        expect(response.status).toBe(201);

        const responseUpdatedUser = await request(server).get(`/api/users/${userId}`);
        expect(responseUpdatedUser.body.username).toBe(updateUserData.username);
        expect(responseUpdatedUser.body.age).toBe(updateUserData.age);
        expect(responseUpdatedUser.body.hobbies).toEqual(newUser.hobbies);
    });

    it('DELETE /api/users/:userId - should delete the user', async () => {
        const response = await request(server).delete(`/api/users/${userId}`);
        expect(response.status).toBe(204);
    });

    it('GET /api/users/:userId - should return 404 for deleted user', async () => {
        const response = await request(server).get(`/api/users/${userId}`);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'User not found.' });
    });
});
