import { AuthService } from './auth/AuthService.js';
import { InteractionTracker } from './interaction/InteractionTracker.js';
import { ScenarioManager } from './scenario/ScenarioManager.js';

async function main() {
  console.log('🚀 Starting Test Recorder POC...');
  
  const auth = await AuthService.initialize();
  const tracker = new InteractionTracker();
  const scenarioManager = new ScenarioManager();

  try {
    console.log('🔐 Authenticating user...');
    const user = await auth.authenticate({ username: 'admin', password: 'admin123' });
    
    if (!user) {
      console.error(' Authentication failed');
      return;
    }
    console.log('✅ Authentication successful');

    console.log('📝 Creating new test scenario...');
    const scenario = await scenarioManager.createScenario('Test Scenario');
    console.log(`✅ Created scenario with ID: ${scenario.id}`);
    
    console.log('🎥 Starting recording session...');
    await tracker.start('https://calendly.com');
    console.log('⚡ Recording started. Press Ctrl+C to stop...');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping recording...');
      const interactions = await tracker.stop();
      
      console.log('💾 Saving recorded interactions...');
      await scenarioManager.addInteractions(scenario.id, interactions);
      
      console.log('✅ Recording stopped and saved successfully');
      console.log('👋 Goodbye!');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 