import express from 'express';
import { getMarketPrices } from '../services/albionService';

const router = express.Router();

router.get('/', async (req, res) => {
  const item = req.query.item as string;
  const cities = (req.query.cities as string)?.split(',') || [];
  const quality = req.query.quality ? Number(req.query.quality) : undefined;

  if (!item || cities.length === 0) {
    return res.status(400).json({ error: 'Missing item or cities query params' });
  }

  if (quality != undefined && quality > 5) {
    return res.status(400).json({ error: "Invalid item quality (must be 1-5)" })
  }

  try {
    const prices = await getMarketPrices(item, cities);
    const filtered = quality? prices.filter(p => p.quality === Number(quality)) : prices;

    const validPrices = filtered
      .filter(p => p.sell_price_min > 0)
      .sort((a, b) => a.sell_price_min - b.sell_price_min);

    if (validPrices.length < 2) {
      return res.status(404).json({ error: 'Not enough valid listings to evaluate arbitrage.' });
    }

    let i = 0;
    let j = validPrices.length - 1;
    let bestTrade = null;

    while (i < j) {
      const buy = validPrices[i];
      const sell = validPrices[j];

      if (buy.city !== sell.city) {
        const profit = sell.sell_price_min - buy.sell_price_min;

        bestTrade = {
          item,
          buy: { city: buy.city, price: buy.sell_price_min },
          sell: { city: sell.city, price: sell.sell_price_min },
          buy_quality: buy.quality,
          sell_quality: sell.quality,
          profit
        };
        break;
      }

      const profitIfNextBuy = validPrices[j].sell_price_min - validPrices[i + 1].sell_price_min;
      const profitIfPrevSell = validPrices[j - 1].sell_price_min - validPrices[i].sell_price_min;

      if (profitIfNextBuy > profitIfPrevSell) {
        i++;
      } else {
        j--;
      }
    }
    
    if (bestTrade) {
      return res.json(bestTrade);
    } else {
      return res.json({ message: 'No valid arbitrage opportunity found between different cities.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


// example url: http://localhost:3000/api/arbitrage?item=T4_2H_DUALSICKLE_UNDEAD&cities=Bridgewatch,Lymhurst,Thetford,Martlock,FortSterling
// item: T7.0 Deathgivers