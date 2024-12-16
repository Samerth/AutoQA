import React, { useState } from 'react';
import { scenarioApi } from '../api/scenarioApi';

interface Scenario {
  id: string;
  name: string;
  createdAt: Date;
}

interface ScenarioListProps {
  scenarios: Scenario[];
  onSelectScenario: (id: string) => void;
  onRunTest: (id: string) => void;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({
  scenarios,
  onSelectScenario,
  onRunTest,
}) => {
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunTest = async (id: string) => {
    setError(null);
    try {
      console.log('Starting scenario run:', id);
      setRunningScenario(id);
      await scenarioApi.runScenario(id);
      console.log('Scenario completed:', id);
      onRunTest(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run scenario';
      console.error('Failed to run scenario:', error);
      setError(message);
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="scenario-list">
      <h2>Test Scenarios</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="scenarios">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-item">
            <span>{scenario.name}</span>
            <div className="actions">
              <button onClick={() => onSelectScenario(scenario.id)}>
                Edit
              </button>
              <button 
                onClick={() => handleRunTest(scenario.id)}
                disabled={runningScenario === scenario.id}
              >
                {runningScenario === scenario.id ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 