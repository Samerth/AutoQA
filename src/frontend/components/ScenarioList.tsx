import React from 'react';

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
  return (
    <div className="scenario-list">
      <h2>Test Scenarios</h2>
      <div className="scenarios">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-item">
            <span>{scenario.name}</span>
            <div className="actions">
              <button onClick={() => onSelectScenario(scenario.id)}>
                📝 Edit
              </button>
              <button onClick={() => onRunTest(scenario.id)}>
                ▶️ Run
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 