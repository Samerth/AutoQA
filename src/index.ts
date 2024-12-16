import { runScenario } from './scenario/runScenario';

// Run a specific scenario
const scenarioId = '8676f2a6-9091-4175-b5ca-251e2cabc081';
runScenario(scenarioId)
  .then(() => console.log('Scenario completed successfully'))
  .catch(error => console.error('Failed to run scenario:', error)); 