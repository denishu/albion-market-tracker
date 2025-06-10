import express, { Request, Response } from 'express';
import { getCitySellOrdersOldEndpoint } from '../services/albionService';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const item = req.query.item as string;
  const city = req.query.city as string;
  const quality = req.query.quality ? Number(req.query.quality) : undefined;

  if (!item || !city) {
    return res.status(400).json({ error: 'Missing item or city query params' });
  }

  if (!item) {
    return res.status(400).json({ error: 'Missing item query param' });
  }

  if (quality != undefined && (quality > 5)) {
    return res.status(400).json({ error: "Invalid item quality" })
  }


  try {
    const orders = await getCitySellOrdersOldEndpoint(item, city);
    const filtered = quality? orders.filter(p => p.quality === Number(quality)) : orders;

    if (filtered.length === 0) {
      return res.status(404).json({ error: 'Item is not being sold in this city.' });
    }

    const total = filtered.reduce((sum, o) => sum + o.sell_price_min, 0);
    const average = Math.round(total / filtered.length);
    const numOfItems = filtered.length;

    return res.json({ city, item, numOfItems, average, filtered });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch city sell orders' });
  }
});

export default router;

// example url: http://localhost:3000/api/city-prices?item=T6_MOUNT_DIREWOLF&city=Lymhurst&quality=1
// item: T6 Direwolf