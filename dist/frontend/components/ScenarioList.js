import React from 'react';
export const ScenarioList = ({ scenarios, onSelectScenario, onRunTest, }) => {
    return (<div className="scenario-list">
      <h2>Test Scenarios</h2>
      <div className="scenarios">
        {scenarios.map((scenario) => (<div key={scenario.id} className="scenario-item">
            <span>{scenario.name}</span>
            <div className="actions">
              <button onClick={() => onSelectScenario(scenario.id)}>
                📝 Edit
              </button>
              <button onClick={() => onRunTest(scenario.id)}>
                ▶️ Run
              </button>
            </div>
          </div>))}
      </div>
    </div>);
};
