import axios from 'axios';

export async function getMarketPrices(item: string, cities: string[], quality?: number) {
  const requests = cities.map(city => {
    const baseUrl = `https://west.albion-online-data.com/api/v2/stats/prices/${item}.json`;
    const params = [`locations=${city}`];
    if (quality !== undefined) {
      params.push(`quality=${quality}`);
    }

    const url = `${baseUrl}?${params.join('&')}`;
    return axios.get<any>(url);
  }
    
  );

  const responses = await Promise.all(requests);
  const data = responses.flatMap(res => res.data);

  return data;
}

export async function getCitySellOrders(item: string, cities: string[], quality?: number) {
  const requests = cities.map(city => {
    const params = new URLSearchParams();
    params.append('locations', city);
    if (quality !== undefined) {
      params.append('qualities', quality.toString());
    }

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${item}.json?${params.toString()}`


    return axios.get(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
  });

  const responses = await Promise.all(requests);
  const data = responses.flatMap(res => res.data);
  return data;
}

export async function getCitySellOrdersOldEndpoint(item: string, city: string, quality?: number) {
  const baseUrl = item
    ? `https://west.albion-online-data.com/api/v2/stats/prices/${item}.json?`
    : `https://west.albion-online-data.com/api/v2/stats/prices/T4_BAG.json?`;
  const params = [`locations=${city}`];
  if (quality !== undefined && quality < 6) {
    params.push(`quality=${quality}`);
  }

  const url = `${baseUrl}?${params.join('&')}`;
  const response = await axios.get<any[]>(url);

  // Filter for valid sell orders in the given city
  const filtered = response.data.filter(p => p.sell_price_min > 0 && p.city === city);

  return filtered;
}

export async function predictItemPrice(
  item: string,
  city: string,
  quality?: number
): Promise<{ average: number; trend: string }> {
  const params = new URLSearchParams();
  params.append('locations', city);
  if (quality !== undefined) {
    params.append('qualities', quality.toString());
  }

  const url = `https://west.albion-online-data.com/api/v2/stats/view/${item}.json?${params.toString()}`;

  const response = await axios.get(url, {
    headers: { Accept: 'application/json' }
  });

  const prices = response.data?.filter(
    (entry: any) => entry.sell_price_min > 0 && entry.sell_price_min_date
  );

  if (!prices || prices.length === 0) {
    throw new Error('No historical data found for prediction');
  }

  // Sort by date ascending
  prices.sort(
    (a: any, b: any) =>
      new Date(a.sell_price_min_date).getTime() -
      new Date(b.sell_price_min_date).getTime()
  );

  const priceValues = prices.map((entry: any) => entry.sell_price_min);
  const average =
    priceValues.reduce((sum: number, p: number) => sum + p, 0) /
    priceValues.length;

  const trend =
    priceValues[0] < priceValues[priceValues.length - 1]
      ? 'increasing'
      : priceValues[0] > priceValues[priceValues.length - 1]
      ? 'decreasing'
      : 'stable';

  return {
    average: Math.round(average),
    trend
  };
}