export const scenarioApi = {
  async listScenarios() {
    const response = await fetch('/api/scenarios');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch scenarios');
    }
    return await response.json();
  },

  async runScenario(id: string): Promise<void> {
    console.log(`Running scenario: ${id}`);
    const response = await fetch(`/api/scenarios/${id}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to run scenario:', errorData);
      throw new Error(errorData.error || 'Failed to run scenario');
    }

    const result = await response.json();
    console.log('Scenario run result:', result);
  },

  async startRecording(url: string): Promise<void> {
    const response = await fetch('/api/record/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start recording');
    }
  },

  async stopRecording(): Promise<{ scenarioId: string }> {
    const response = await fetch('/api/record/stop', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to stop recording');
    }

    return await response.json();
  }
}; 