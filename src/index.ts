import { createServer } from '../src/server';

createServer().catch(err => {
    console.error('createServer initialization error:', err);
    process.exit(1);
});