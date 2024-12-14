import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from '../storage/FileStorage.js';
export class ScenarioManager {
    storage;
    constructor() {
        console.log('📋 Initializing ScenarioManager...');
        this.storage = new FileStorage();
    }
    async createScenario(name, description) {
        console.log(`📝 Creating new scenario: ${name}`);
        const scenario = {
            id: uuidv4(),
            name,
            description,
            interactions: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        await this.storage.saveScenario(scenario);
        console.log(`✅ Scenario created with ID: ${scenario.id}`);
        return scenario;
    }
    async addInteractions(scenarioId, interactions) {
        console.log(`📥 Adding ${interactions.length} interactions to scenario: ${scenarioId}`);
        const scenario = await this.storage.getScenario(scenarioId);
        if (!scenario) {
            console.error(`❌ Scenario not found: ${scenarioId}`);
            throw new Error('Scenario not found');
        }
        scenario.interactions.push(...interactions);
        scenario.updatedAt = Date.now();
        await this.storage.saveScenario(scenario);
        console.log(`✅ Added interactions to scenario: ${scenarioId}`);
        console.log(`📊 Total interactions in scenario: ${scenario.interactions.length}`);
        return scenario;
    }
    async getScenario(id) {
        console.log(`🔍 Retrieving scenario: ${id}`);
        const scenario = await this.storage.getScenario(id);
        console.log(scenario ? `✅ Scenario found: ${id}` : `⚠️ Scenario not found: ${id}`);
        return scenario;
    }
    async listScenarios() {
        console.log('📋 Listing all scenarios...');
        const scenarios = await this.storage.listScenarios();
        console.log(`📊 Found ${scenarios.length} scenarios`);
        return scenarios;
    }
}
