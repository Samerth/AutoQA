import { chromium, Browser, Page } from 'playwright';
import { Scenario } from './types';
import { Interaction, InteractionType } from '../interaction/types';

export class ScenarioPlayer {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async start(): Promise<void> {
    console.log('Starting ScenarioPlayer...');
    try {
      this.browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox']
      });
      this.page = await this.browser.newPage();
      console.log('Browser launched successfully');
    } catch (error) {
      console.error('Failed to start browser:', error);
      throw error;
    }
  }

  async playScenario(scenario: Scenario): Promise<void> {
    if (!this.page) {
      throw new Error('Player not initialized. Call start() first.');
    }

    console.log(`Playing scenario: ${scenario.id} with ${scenario.interactions.length} interactions`);

    try {
      for (const interaction of scenario.interactions) {
        console.log(`Playing interaction: ${interaction.type} at ${interaction.url}`);
        await this.playInteraction(interaction);
        // Add a delay between actions
        await this.page.waitForTimeout(1000);
      }
      console.log('Scenario playback completed');
    } catch (error) {
      console.error('Failed to play scenario:', error);
      throw error;
    }
  }

  private async playInteraction(interaction: Interaction): Promise<void> {
    if (!this.page) return;

    try {
      console.log(`Playing interaction: ${interaction.type} at ${interaction.url}`);
      
      switch (interaction.type) {
        case InteractionType.NAVIGATION:
          await this.handleNavigation(interaction);
          break;

        case InteractionType.CLICK:
          await this.handleClick(interaction);
          // Wait for any navigation that might happen after click
          try {
            await this.page.waitForNavigation({ 
              timeout: 2000,
              waitUntil: 'networkidle' 
            });
          } catch (error) {
            // Navigation might not happen, that's okay
          }
          break;

        case InteractionType.INPUT:
          await this.handleInput(interaction);
          break;

        case InteractionType.KEYPRESS:
          await this.handleKeyPress(interaction);
          break;
      }
      
      // Add a small delay between actions
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.error(`Failed to play interaction:`, interaction, error);
      throw error;
    }
  }

  private async handleNavigation(interaction: Interaction): Promise<void> {
    if (!this.page) return;
    console.log(`Navigating to: ${interaction.url}`);
    await this.page.goto(interaction.url);
    await this.page.waitForLoadState('networkidle');
    console.log('Navigation completed');
  }

  private async handleClick(interaction: Interaction): Promise<void> {
    if (!this.page) return;
    console.log('Handling click:', interaction);

    try {
      // If it's a click interaction with href metadata, handle it as a navigation
      if (interaction.type === InteractionType.CLICK && 
          interaction.metadata?.href && 
          interaction.metadata.isButton) {
        console.log('Handling click as navigation:', interaction.metadata.href);
        const targetUrl = new URL(interaction.metadata.href, interaction.url).href;
        await this.page.goto(targetUrl);
        await this.page.waitForLoadState('networkidle');
        return;
      }

      // Try different strategies to find the element
      let element = null;

      // Try by selector
      if (interaction.selector && !element) {
        element = await this.page.$(interaction.selector);
        console.log('Found by selector:', !!element);
      }

      // Try by XPath
      if (interaction.xpath && !element) {
        element = await this.page.$(interaction.xpath);
        console.log('Found by xpath:', !!element);
      }

      // Try by text content
      if (interaction.innerText && !element) {
        element = await this.page.getByText(interaction.innerText, { exact: true });
        console.log('Found by text:', !!element);
      }

      // Try by role and text
      if (interaction.metadata?.role && interaction.innerText && !element) {
        element = await this.page.getByRole(interaction.metadata.role, { name: interaction.innerText });
        console.log('Found by role and text:', !!element);
      }

      if (!element) {
        throw new Error(`Could not find element to click: ${JSON.stringify(interaction)}`);
      }

      // Make sure element is visible and clickable
      await element.scrollIntoViewIfNeeded();
      await element.waitForElementState('stable');
      await element.click();
      
      // Wait for any navigation that might happen after click
      await this.page.waitForLoadState('networkidle');

    } catch (error) {
      console.error('Failed to handle click:', error);
      throw error;
    }
  }

  private async handleInput(interaction: Interaction): Promise<void> {
    if (!this.page) return;
    const element = await this.findElement(interaction);
    if (element) {
      await element.click();
      await element.fill('');
      await element.type(interaction.value || '');
    }
  }

  private async handleKeyPress(interaction: Interaction): Promise<void> {
    if (!this.page) return;
    const modifiers = (interaction as any).modifiers || {};
    const key = (interaction as any).key;
    await this.page.keyboard.press(key);
  }

  private async findElement(interaction: Interaction): Promise<any> {
    if (!this.page) return null;

    let element = null;
    const attempts = [];

    try {
      // Try XPath first
      if (interaction.xpath) {
        element = await this.page.$(interaction.xpath);
        attempts.push(`XPath: ${!!element}`);
      }

      // Try selector
      if (!element && interaction.selector) {
        element = await this.page.$(interaction.selector);
        attempts.push(`Selector: ${!!element}`);
      }

      // Try by text content
      if (!element && interaction.innerText) {
        element = await this.page.getByText(interaction.innerText, { exact: true });
        attempts.push(`Text: ${!!element}`);
      }

      // Try by role and text
      if (!element && interaction.metadata?.role && interaction.innerText) {
        element = await this.page.getByRole(interaction.metadata.role, { name: interaction.innerText });
        attempts.push(`Role+Text: ${!!element}`);
      }

      // Try by aria-label
      if (!element && interaction.metadata?.ariaLabel) {
        element = await this.page.getByLabel(interaction.metadata.ariaLabel);
        attempts.push(`Aria-label: ${!!element}`);
      }

      if (!element) {
        console.error('Element not found. Attempts:', attempts.join(', '));
        throw new Error(`Could not find element: ${interaction.selector || interaction.xpath}`);
      }

      return element;
    } catch (error) {
      console.error('Find element attempts:', attempts.join(', '));
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('Browser closed successfully');
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    } finally {
      this.browser = null;
      this.page = null;
    }
  }
} 