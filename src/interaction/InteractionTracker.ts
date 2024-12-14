import { chromium, Browser, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { Interaction, InteractionType } from './types.js';

export class InteractionTracker {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private interactions: Interaction[] = [];

  async start(url: string): Promise<void> {
    console.log('🚀 Starting InteractionTracker...');
    console.log(`📱 Launching browser and navigating to: ${url}`);
    
    try {
      this.browser = await chromium.launch({ headless: false });
      this.page = await this.browser.newPage();
      await this.page.goto(url);
      
      console.log('✅ Browser launched successfully');
      await this.setupEventListeners();
    } catch (error) {
      console.error('❌ Failed to start browser:', error);
      throw error;
    }
  }

  private async setupEventListeners(): Promise<void> {
    console.log('🎯 Setting up event listeners...');
    
    if (!this.page) {
      console.error('❌ Page not initialized');
      throw new Error('Page not initialized');
    }

    await this.page.exposeFunction('recordInteraction', (interaction: Omit<Interaction, 'id' | 'timestamp'>) => {
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
      const recordInteraction = (window as any).recordInteraction;
      
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        recordInteraction({
          type: 'click',
          selector: getCssSelector(target)
        });
      });

      document.addEventListener('input', (event) => {
        const target = event.target as HTMLElement;
        recordInteraction({
          type: 'input',
          selector: getCssSelector(target),
          value: (target as HTMLInputElement).value
        });
      });

      function getCssSelector(element: HTMLElement): string {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const classes = Array.from(element.classList).join('.');
          if (classes) return `.${classes}`;
        }
        return element.tagName.toLowerCase();
      }
    });
    
    console.log('✅ Event listeners setup complete');
  }

  async stop(): Promise<Interaction[]> {
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