import { validate as isValidUUID } from 'uuid';

export const validateUUID = (id: string | undefined): boolean => {
    return isValidUUID(id || '');
};

export const validateUserData = (data: any): boolean => {
    const { username, age, hobbies } = data;
    return (
        username && typeof username === 'string' && username.trim() !== '' &&
        age !== undefined && typeof age === 'number' &&
        Array.isArray(hobbies)
    );
};
