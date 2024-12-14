import express from 'express';
import { AuthService } from '../auth/AuthService.js';
import { InteractionTracker } from '../interaction/InteractionTracker.js';
import { ScenarioManager } from '../scenario/ScenarioManager.js';
export async function createServer() {
    const app = express();
    app.use(express.json());
    const auth = await AuthService.initialize();
    const tracker = new InteractionTracker();
    const scenarioManager = new ScenarioManager();
    // API Routes
    app.get('/api/scenarios', async (req, res) => {
        try {
            const scenarios = await scenarioManager.listScenarios();
            res.json(scenarios);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch scenarios' });
        }
    });
    app.post('/api/record/start', async (req, res) => {
        try {
            await tracker.start('https://calendly.com');
            res.json({ status: 'recording' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to start recording' });
        }
    });
    app.post('/api/record/stop', async (req, res) => {
        try {
            const interactions = await tracker.stop();
            const scenario = await scenarioManager.createScenario('New Test Scenario');
            await scenarioManager.addInteractions(scenario.id, interactions);
            res.json({ status: 'stopped', scenarioId: scenario.id });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to stop recording' });
        }
    });
    app.post('/api/scenarios/:id/run', (async (req, res) => {
        try {
            const scenario = await scenarioManager.getScenario(req.params.id);
            if (!scenario) {
                return res.status(404).json({ error: 'Scenario not found' });
            }
            res.json({ status: 'completed' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to run test' });
        }
    }));
    return app;
}
