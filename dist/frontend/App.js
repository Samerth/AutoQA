import React, { useState, useEffect } from 'react';
import { TestRecorder } from './components/TestRecorder.js';
import { ScenarioList } from './components/ScenarioList.js';
import './App.css';
function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [scenarios, setScenarios] = useState([]);
    const [currentScenario, setCurrentScenario] = useState(null);
    const handleStartRecording = async () => {
        try {
            // Call your backend API to start recording
            const response = await fetch('/api/record/start', {
                method: 'POST',
            });
            if (response.ok) {
                setIsRecording(true);
            }
        }
        catch (error) {
            console.error('Failed to start recording:', error);
        }
    };
    const handleStopRecording = async () => {
        try {
            // Call your backend API to stop recording
            const response = await fetch('/api/record/stop', {
                method: 'POST',
            });
            if (response.ok) {
                setIsRecording(false);
                // Refresh scenarios list
                fetchScenarios();
            }
        }
        catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };
    const fetchScenarios = async () => {
        try {
            const response = await fetch('/api/scenarios');
            if (response.ok) {
                const data = await response.json();
                setScenarios(data);
            }
        }
        catch (error) {
            console.error('Failed to fetch scenarios:', error);
        }
    };
    const handleRunTest = async (scenarioId) => {
        try {
            const response = await fetch(`/api/scenarios/${scenarioId}/run`, {
                method: 'POST',
            });
            if (response.ok) {
                // Handle successful test run
                console.log('Test completed successfully');
            }
        }
        catch (error) {
            console.error('Failed to run test:', error);
        }
    };
    useEffect(() => {
        fetchScenarios();
    }, []);
    return (<div className="app">
      <header>
        <h1>Test Recorder</h1>
      </header>
      
      <main>
        <div className="recorder-section">
          <TestRecorder isRecording={isRecording} onStartRecording={handleStartRecording} onStopRecording={handleStopRecording}/>
        </div>
        
        <div className="scenarios-section">
          <ScenarioList scenarios={scenarios} onSelectScenario={(id) => setCurrentScenario(id)} onRunTest={handleRunTest}/>
        </div>
      </main>
    </div>);
}
export default App;
