import fs from 'fs/promises';
import path from 'path';
export class FileStorage {
    storagePath;
    constructor() {
        console.log('💾 Initializing FileStorage...');
        this.storagePath = path.join(process.cwd(), 'scenarios');
        this.initStorage();
    }
    async initStorage() {
        console.log(`📁 Ensuring storage directory exists: ${this.storagePath}`);
        try {
            await fs.mkdir(this.storagePath, { recursive: true });
            console.log('✅ Storage directory ready');
        }
        catch (error) {
            console.error('❌ Failed to initialize storage:', error);
        }
    }
    async saveScenario(scenario) {
        const filePath = path.join(this.storagePath, `${scenario.id}.json`);
        console.log(`💾 Saving scenario to: ${filePath}`);
        try {
            await fs.writeFile(filePath, JSON.stringify(scenario, null, 2));
            console.log(`✅ Scenario saved successfully: ${scenario.id}`);
        }
        catch (error) {
            console.error(`❌ Failed to save scenario ${scenario.id}:`, error);
            throw error;
        }
    }
    async getScenario(id) {
        const filePath = path.join(this.storagePath, `${id}.json`);
        console.log(`🔍 Reading scenario from: ${filePath}`);
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            console.log(`✅ Successfully read scenario: ${id}`);
            return JSON.parse(content);
        }
        catch (error) {
            console.warn(`⚠️ Failed to read scenario ${id}:`, error);
            return null;
        }
    }
    async listScenarios() {
        console.log(`📂 Reading scenarios from: ${this.storagePath}`);
        const scenarios = [];
        try {
            const files = await fs.readdir(this.storagePath);
            console.log(`📊 Found ${files.length} files in storage directory`);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    console.log(`📄 Reading file: ${file}`);
                    const content = await fs.readFile(path.join(this.storagePath, file), 'utf-8');
                    scenarios.push(JSON.parse(content));
                }
            }
            console.log(`✅ Successfully loaded ${scenarios.length} scenarios`);
            return scenarios;
        }
        catch (error) {
            console.error('❌ Failed to list scenarios:', error);
            throw error;
        }
    }
}
