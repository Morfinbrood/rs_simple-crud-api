import { User } from '../types';

let users: User[] = [];

export const userDataStore = {
    getAll: async (): Promise<User[]> => {
        return users;
    },

    getById: async (id: string): Promise<User | undefined> => {
        return users.find(user => user.id === id);
    },

    add: async (user: User): Promise<User> => {
        users.push(user);
        return user;
    },

    update: async (id: string, updatedUser: User): Promise<User | undefined> => {
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) return undefined;

        users[userIndex] = updatedUser;
        return updatedUser;
    },

    delete: async (id: string): Promise<boolean> => {
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) return false;

        users.splice(userIndex, 1);
        return true;
    },
};
