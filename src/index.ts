import { createServer } from './server';

createServer().catch(err => {
    console.error('createServer initialization error:', err);
    process.exit(1);
});