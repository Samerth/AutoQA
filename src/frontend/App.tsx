import React, { useState, useEffect } from 'react';
import { TestRecorder } from './components/TestRecorder.js';
import { ScenarioList } from './components/ScenarioList.js';
import { scenarioApi } from './api/scenarioApi';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);

  const handleStartRecording = async () => {
    try {
      console.log('Starting recording...');
      await scenarioApi.startRecording('https://calendly.com');
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await scenarioApi.stopRecording();
      setIsRecording(false);
      // Refresh scenarios list
      fetchScenarios();
      console.log('Recording stopped, created scenario:', result.scenarioId);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const fetchScenarios = async () => {
    try {
      const data = await scenarioApi.listScenarios();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
    }
  };

  const handleRunTest = async (scenarioId: string) => {
    try {
      await scenarioApi.runScenario(scenarioId);
      console.log('Test completed successfully');
    } catch (error) {
      console.error('Failed to run test:', error);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Test Recorder</h1>
      </header>
      
      <main>
        <div className="recorder-section">
          <TestRecorder
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </div>
        
        <div className="scenarios-section">
          <ScenarioList
            scenarios={scenarios}
            onSelectScenario={(id: string) => setCurrentScenario(id)}
            onRunTest={handleRunTest}
          />
        </div>
      </main>
    </div>
  );
}

export default App; 