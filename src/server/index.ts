import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ScenarioController } from '../backend/controllers/ScenarioController';
import { InteractionTracker } from '../interaction/InteractionTracker';
import { ScenarioManager } from '../scenario/ScenarioManager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Important: Add these middleware before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Handle OPTIONS requests
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

let tracker: InteractionTracker | null = null;

// Recording routes
app.post('/api/record/start', async (req, res) => {
  console.log('Received start recording request:', req.body);
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (tracker) {
      await tracker.stop();
    }

    tracker = new InteractionTracker();
    await tracker.start(url);
    console.log('Recording started for URL:', url);
    res.json({ message: 'Recording started' });
  } catch (error) {
    console.error('Failed to start recording:', error);
    res.status(500).json({ error: 'Failed to start recording' });
  }
});

app.post('/api/record/stop', async (req, res) => {
  console.log('Received stop recording request');
  try {
    if (!tracker) {
      return res.status(400).json({ error: 'No active recording' });
    }

    const interactions = await tracker.stop();
    tracker = null;

    const scenarioManager = new ScenarioManager();
    const scenario = await scenarioManager.createScenario('New Test Scenario');
    await scenarioManager.addInteractions(scenario.id, interactions);

    console.log('Recording stopped, created scenario:', scenario.id);
    res.json({ 
      message: 'Recording stopped',
      scenarioId: scenario.id,
      interactionCount: interactions.length
    });
  } catch (error) {
    console.error('Failed to stop recording:', error);
    res.status(500).json({ error: 'Failed to stop recording' });
  }
});

// Scenario routes
app.get('/api/scenarios', async (req, res) => {
  try {
    const scenarios = await ScenarioController.listScenarios();
    res.json(scenarios);
  } catch (error) {
    console.error('Failed to list scenarios:', error);
    res.status(500).json({ error: 'Failed to list scenarios' });
  }
});

app.post('/api/scenarios/:id/run', async (req, res) => {
  try {
    await ScenarioController.runScenario(req, res);
  } catch (error) {
    console.error('Failed to run scenario:', error);
    res.status(500).json({ error: 'Failed to run scenario' });
  }
});

const port = process.env.BACKEND_PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});