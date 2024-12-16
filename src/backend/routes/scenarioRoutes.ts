import express from 'express';
import { ScenarioController } from '../controllers/ScenarioController';

const router = express.Router();

router.post('/scenarios/:id/run', async (req, res) => {
  console.log('Received run request for scenario:', req.params.id);
  try {
    await ScenarioController.runScenario(req, res);
  } catch (error) {
    console.error('Error running scenario:', error);
    res.status(500).json({ error: 'Failed to run scenario' });
  }
});

export default router; 