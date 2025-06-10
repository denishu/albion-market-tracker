import express, { Request, Response } from 'express';
import { predictItemPrice } from '../services/albionService';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const item = req.query.item as string;
  const city = req.query.city as string;
  const quality = req.query.quality ? Number(req.query.quality) : undefined;

  if (!item || !city) {
    return res
      .status(400)
      .json({ error: 'Missing required query params: item, city' });
  }

  try {
    const result = await predictItemPrice(item, city, quality);
    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Prediction error' });
  }
});

export default router;

