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
      
      // Setup event listeners before navigation
      await this.setupEventListeners();
      
      // Navigate to the URL
      await this.page.goto(url);
      console.log('✅ Browser launched successfully');
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

    // Listen for clicks
    this.page.on('click', async (event) => {
      try {
        const element = event.target();
        const selector = await this.getSelector(element);
        
        const interaction: Omit<Interaction, 'id'> = {
          type: InteractionType.CLICK,
          selector,
          timestamp: Date.now()
        };
        
        this.recordInteraction(interaction);
      } catch (error) {
        console.error('Failed to record click:', error);
      }
    });

    // Listen for input changes
    this.page.on('input', async (event) => {
      try {
        const element = event.target();
        const selector = await this.getSelector(element);
        const value = await element.inputValue();
        
        const interaction: Omit<Interaction, 'id'> = {
          type: InteractionType.INPUT,
          selector,
          value,
          timestamp: Date.now()
        };
        
        this.recordInteraction(interaction);
      } catch (error) {
        console.error('Failed to record input:', error);
      }
    });
    
    console.log('✅ Event listeners setup complete');
  }

  private async getSelector(element: any): Promise<string> {
    try {
      // Try to get ID
      const id = await element.getAttribute('id');
      if (id) return `#${id}`;

      // Try to get classes
      const className = await element.getAttribute('class');
      if (className) {
        const classes = className.split(' ').filter(Boolean);
        if (classes.length > 0) return `.${classes.join('.')}`;
      }

      // Fallback to tag name
      const tagName = await element.evaluate((el: HTMLElement) => el.tagName.toLowerCase());
      return tagName;
    } catch (error) {
      console.error('Failed to get selector:', error);
      return 'unknown';
    }
  }

  private recordInteraction(interaction: Omit<Interaction, 'id'>): void {
    const fullInteraction = {
      ...interaction,
      id: uuidv4()
    };
    
    this.interactions.push(fullInteraction);
    console.log('📝 Recorded interaction:', {
      type: fullInteraction.type,
      selector: fullInteraction.selector,
      value: fullInteraction.value
    });
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