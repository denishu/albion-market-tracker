import express, { Request, Response } from 'express';
import { getCitySellOrders } from '../services/albionService';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const item = req.query.item as string;
  const cities = (req.query.cities as string)?.split(',') || [];
  const quality = req.query.quality ? Number(req.query.quality) : undefined;

  if (!item || cities.length === 0) {
    return res.status(400).json({ error: 'Missing item or cities query params' });
  }

  if (quality !== undefined && (isNaN(quality) || quality < 1 || quality > 5)) {
    return res.status(400).json({ error: 'Invalid item quality (1-5 allowed)' });
  }

  try {
    const data = await getCitySellOrders(item, cities, quality);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;