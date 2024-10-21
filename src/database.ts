import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

const usersFilePath = join(__dirname, 'db', 'users.json');

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

let users: User[] = [];

// Load users from JSON file on server startup
const loadUsersFromFile = async (): Promise<void> => {
    try {
        const data = await fs.readFile(usersFilePath, 'utf-8');
        users = JSON.parse(data);
    } catch (error) {
        console.error('Error loading users from file:', error);
        users = [];
    }
};

// Save users to JSON file
const saveUsersToFile = async (): Promise<void> => {
    try {
        const data = JSON.stringify(users, null, 2);
        await fs.writeFile(usersFilePath, data, 'utf-8');
    } catch (error) {
        console.error('Error saving users to file:', error);
    }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
    return users;
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | undefined> => {
    return users.find(user => user.id === id);
};

// Create new user
export const createUser = async (username: string, age: number, hobbies: string[]): Promise<User> => {
    const newUser: User = {
        id: uuidv4(),
        username,
        age,
        hobbies,
    };
    users.push(newUser);
    saveUsersToFile();
    return newUser;
};

// Update existing user
export const updateUser = async (id: string, username: string, age: number, hobbies: string[]): Promise<User | undefined> => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    users[userIndex] = { id, username, age, hobbies };
    saveUsersToFile();
    return users[userIndex];
};

// Delete user by ID
export const deleteUser = async (id: string): Promise<boolean> => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    saveUsersToFile();
    return true;
};

// Initialize database by loading users from JSON file
export const initDatabase = async (): Promise<void> => {
    await loadUsersFromFile();
};
