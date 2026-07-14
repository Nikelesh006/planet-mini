import { createServer } from 'http';
import { app, ready } from '../index';

export default async function handler(req: any, res: any) {
  await ready;
  
  // Create a Node.js server from the Express app
  const server = createServer(app);
  
  return new Promise((resolve, reject) => {
    server.emit('request', req, res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
}
