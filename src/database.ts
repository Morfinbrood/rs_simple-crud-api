import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

let users: User[] = [];

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
    return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    return true;
};

