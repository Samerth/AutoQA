import express from 'express';
import scenarioRoutes from './routes/scenarioRoutes';

const app = express();
app.use(express.json());

// Enable CORS if needed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes
app.use('/api', scenarioRoutes);

const port = process.env.BACKEND_PORT || 4000;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
}); 