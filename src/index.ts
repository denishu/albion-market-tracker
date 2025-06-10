import express from 'express';
import cors from 'cors';
import arbitrageRoutes from './routes/arbitrage';
import cityPricesRoutes from './routes/cityPrices';
import predictRoutes from './routes/predict';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Albion Market API is running');
});

// Server
const PORT = process.env.PORT || 3000;
app.use('/api/arbitrage', arbitrageRoutes);
app.use('/api/city-prices', cityPricesRoutes);
app.use('/api/predict', predictRoutes)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});