import type { Request, Response } from 'express';
import express from 'express';

const router = express.Router();

router.use('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Node.js Express API template' });
});
export default router;
