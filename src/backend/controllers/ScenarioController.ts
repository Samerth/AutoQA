import { Request, Response } from 'express';
import { ScenarioManager } from '../../scenario/ScenarioManager';
import { runScenario } from '../../scenario/runScenario';

export class ScenarioController {
  static async listScenarios() {
    const scenarioManager = new ScenarioManager();
    return await scenarioManager.listScenarios();
  }

  static async runScenario(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log('Starting scenario execution:', id);

    try {
      const scenarioManager = new ScenarioManager();
      const scenario = await scenarioManager.getScenario(id);
      
      if (!scenario) {
        console.error('Scenario not found:', id);
        res.status(404).json({ error: 'Scenario not found' });
        return;
      }

      console.log('Found scenario:', {
        id: scenario.id,
        name: scenario.name,
        interactionCount: scenario.interactions.length
      });

      // Run the scenario
      await runScenario(id);
      
      res.status(200).json({ 
        status: 'completed',
        message: 'Scenario completed successfully',
        scenarioId: id,
        name: scenario.name
      });
    } catch (error) {
      console.error('Failed to run scenario:', id, error);
      res.status(500).json({ 
        error: 'Failed to run scenario',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 