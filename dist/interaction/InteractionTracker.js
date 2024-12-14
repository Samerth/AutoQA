import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
export class InteractionTracker {
    browser = null;
    page = null;
    interactions = [];
    async start(url) {
        console.log('🚀 Starting InteractionTracker...');
        console.log(`📱 Launching browser and navigating to: ${url}`);
        try {
            this.browser = await chromium.launch({ headless: false });
            this.page = await this.browser.newPage();
            await this.page.goto(url);
            console.log('✅ Browser launched successfully');
            await this.setupEventListeners();
        }
        catch (error) {
            console.error('❌ Failed to start browser:', error);
            throw error;
        }
    }
    async setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        if (!this.page) {
            console.error('❌ Page not initialized');
            throw new Error('Page not initialized');
        }
        await this.page.exposeFunction('recordInteraction', (interaction) => {
            const fullInteraction = {
                ...interaction,
                id: uuidv4(),
                timestamp: Date.now()
            };
            this.interactions.push(fullInteraction);
            console.log('📝 Recorded interaction:', {
                type: fullInteraction.type,
                selector: fullInteraction.selector,
                value: fullInteraction.value
            });
        });
        await this.page.evaluate(() => {
            console.log('🎮 Setting up browser event listeners');
            document.addEventListener('click', (event) => {
                const target = event.target;
                console.log('🖱️ Click detected:', target);
                // @ts-ignore
                window.recordInteraction({
                    type: 'click',
                    selector: getCssSelector(target)
                });
            });
            document.addEventListener('input', (event) => {
                const target = event.target;
                console.log('⌨️ Input detected:', target);
                // @ts-ignore
                window.recordInteraction({
                    type: 'input',
                    selector: getCssSelector(target),
                    value: target.value
                });
            });
            function getCssSelector(element) {
                if (element.id)
                    return `#${element.id}`;
                if (element.className)
                    return `.${element.className.split(' ').join('.')}`;
                return element.tagName.toLowerCase();
            }
        });
        console.log('✅ Event listeners setup complete');
    }
    async stop() {
        console.log('🛑 Stopping interaction tracking...');
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            console.log('✅ Browser closed successfully');
        }
        console.log(`📊 Total interactions recorded: ${this.interactions.length}`);
        return this.interactions;
    }
}
