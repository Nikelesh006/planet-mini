import { app, ready } from '../index.js';

export default async function handler(req: any, res: any) {
  try {
    await ready;
    return app(req, res);
  } catch (error) {
    console.error("Initialization error:", error);
    res.statusCode = 500;
    res.json({ error: "Failed to initialize server", details: (error as Error).message });
  }
}
