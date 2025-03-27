import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { userDataStore } from '../dataStore/userDataStore';

export const getAllUsers = async (): Promise<User[]> => {
    return userDataStore.getAll();
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    return userDataStore.getById(id);
};

export const createUser = async (username: string, age: number, hobbies: string[]): Promise<User> => {
    const newUser: User = {
        id: uuidv4(),
        username,
        age,
        hobbies,
    };
    return userDataStore.add(newUser);
};

export const updateUser = async (id: string, username?: string, age?: number, hobbies?: string[]): Promise<User | undefined> => {
    const currentUser = await userDataStore.getById(id);
    if (!currentUser) return undefined;

    const updatedUser = {
        ...currentUser,
        ...(username !== undefined && { username }),
        ...(age !== undefined && { age }),
        ...(hobbies !== undefined && { hobbies }),
    };

    return userDataStore.update(id, updatedUser);
};

export const deleteUser = async (id: string): Promise<boolean> => {
    return userDataStore.delete(id);
};
