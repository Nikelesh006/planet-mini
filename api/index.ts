import { initApp } from '../server/index';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const app = await initApp();
  return app(req, res);
}
