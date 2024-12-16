import { ScenarioManager } from './ScenarioManager';
import { ScenarioPlayer } from './ScenarioPlayer';

export async function runScenario(scenarioId: string): Promise<void> {
  console.log('Starting runScenario for:', scenarioId);
  const scenarioManager = new ScenarioManager();
  const player = new ScenarioPlayer();

  try {
    // Load the scenario
    const scenario = await scenarioManager.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    console.log('Found scenario:', {
      id: scenario.id,
      name: scenario.name,
      interactions: scenario.interactions.length
    });

    // Initialize the player
    await player.start();

    // Play the scenario
    await player.playScenario(scenario);

  } catch (error) {
    console.error('Failed to run scenario:', error);
    throw error;
  } finally {
    // Clean up
    try {
      await player.stop();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
} 