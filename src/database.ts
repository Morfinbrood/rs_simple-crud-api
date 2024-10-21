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

const loadUsersFromFile = async (): Promise<void> => {
    try {
        const data = await fs.readFile(usersFilePath, 'utf-8');
        users = JSON.parse(data);
    } catch (error) {
        console.error('Error loading users from file:', error);
        users = [];
    }
};

const saveUsersToFile = async (): Promise<void> => {
    try {
        const data = JSON.stringify(users, null, 2);
        await fs.writeFile(usersFilePath, data, 'utf-8');
    } catch (error) {
        console.error('Error saving users to file:', error);
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    return users;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    return users.find(user => user.id === id);
};

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

export const updateUser = async (id: string, username?: string, age?: number, hobbies?: string[]): Promise<User | undefined> => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    const currentUser = users[userIndex];

    const updatedUser = {
        ...currentUser,
        ...(username !== undefined && { username }),
        ...(age !== undefined && { age }),
        ...(hobbies !== undefined && { hobbies }),
    };

    users[userIndex] = updatedUser;
    saveUsersToFile();
    return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    saveUsersToFile();
    return true;
};

export const initDatabase = async (): Promise<void> => {
    await loadUsersFromFile();
};
