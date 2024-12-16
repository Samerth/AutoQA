import { chromium, Browser, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { Interaction, InteractionType } from './types.js';

export class InteractionTracker {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private interactions: Interaction[] = [];
  private lastNavigation: { url: string; timestamp: number } | null = null;
  private readonly navigationDebounceTime = 1000; // 1 second
  private initialNavigation = true;

  async start(url: string): Promise<void> {
    console.log('Starting InteractionTracker...');
    
    try {
      this.browser = await chromium.launch({ headless: false });
      this.page = await this.browser.newPage();
      
      await this.setupEventListeners();
      
      // Initial navigation
      await this.page.goto(url);
      this.lastNavigation = { url, timestamp: Date.now() };
      this.initialNavigation = false;
      console.log('Browser launched and navigated to:', url);
    } catch (error) {
      console.error('Failed to start browser:', error);
      throw error;
    }
  }

  private async setupEventListeners(): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    // Click handling with enhanced element detection
    this.page.on('click', async (event) => {
      try {
        const element = event.target();
        
        // Get all possible identifiers
        const selector = await this.getSelector(element);
        const xpath = await this.getXPath(element);
        const tagName = await element.evaluate((el: HTMLElement) => el.tagName.toLowerCase());
        const innerText = await element.evaluate((el: HTMLElement) => el.innerText?.trim() || '');
        const href = await element.getAttribute('href');
        const type = await element.getAttribute('type');
        const role = await element.getAttribute('role');
        const ariaLabel = await element.getAttribute('aria-label');
        
        // Record the click interaction
        const clickInteraction: Omit<ClickInteraction, 'id'> = {
          type: InteractionType.CLICK,
          selector,
          xpath,
          innerText,
          url: this.page.url(),
          timestamp: Date.now(),
          metadata: {
            tagName,
            href,
            type,
            role,
            ariaLabel,
            isButton: tagName === 'button' || 
                      type === 'button' || 
                      role === 'button' ||
                      (tagName === 'a' && href)
          }
        };
        
        console.log('Recording click:', {
          element: tagName,
          text: innerText,
          href,
          selector
        });
        
        this.recordInteraction(clickInteraction);

        // If this is a link or button that might navigate, wait for potential navigation
        if (href || type === 'submit' || role === 'link') {
          try {
            await this.page.waitForNavigation({ 
              timeout: 2000,
              waitUntil: 'networkidle' 
            });
          } catch (error) {
            // Navigation might not happen, that's okay
          }
        }
      } catch (error) {
        console.error('Failed to record click:', error);
      }
    });

    // Navigation handling with debouncing
    this.page.on('framenavigated', async (frame) => {
      if (frame === this.page?.mainFrame()) {
        const currentUrl = frame.url();
        const currentTime = Date.now();

        // Skip initial page load navigation events
        if (this.initialNavigation) {
          return;
        }

        // Skip if this is a duplicate navigation within debounce time
        if (this.lastNavigation && 
            this.lastNavigation.url === currentUrl && 
            currentTime - this.lastNavigation.timestamp < this.navigationDebounceTime) {
          return;
        }

        // Only record navigation if URL actually changed
        if (this.lastNavigation?.url !== currentUrl) {
          const interaction: Omit<NavigationInteraction, 'id'> = {
            type: InteractionType.NAVIGATION,
            fromUrl: this.lastNavigation?.url || '',
            toUrl: currentUrl,
            timestamp: currentTime,
            selector: 'window',
            url: currentUrl
          };
          
          this.recordInteraction(interaction);
          this.lastNavigation = { url: currentUrl, timestamp: currentTime };
        }
      }
    });

    // Input handling
    this.page.on('input', async (event) => {
      try {
        const element = event.target();
        const selector = await this.getSelector(element);
        const xpath = await this.getXPath(element);
        const value = await element.inputValue();
        
        const interaction: Omit<Interaction, 'id'> = {
          type: InteractionType.INPUT,
          selector,
          xpath,
          value,
          url: this.page.url(),
          timestamp: Date.now()
        };
        
        this.recordInteraction(interaction);
      } catch (error) {
        console.error('Failed to record input:', error);
      }
    });
  }

  private async getSelector(element: any): Promise<string> {
    try {
      // Try to get ID
      const id = await element.getAttribute('id');
      if (id) return `#${id}`;

      // Try to get data-testid
      const testId = await element.getAttribute('data-testid');
      if (testId) return `[data-testid="${testId}"]`;

      // Try to get aria-label
      const ariaLabel = await element.getAttribute('aria-label');
      if (ariaLabel) return `[aria-label="${ariaLabel}"]`;

      // Try to get classes
      const className = await element.getAttribute('class');
      if (className) {
        const classes = className.split(' ').filter(Boolean);
        if (classes.length > 0) return `.${classes.join('.')}`;
      }

      // Try to get role
      const role = await element.getAttribute('role');
      if (role) return `[role="${role}"]`;

      // Get more specific selector using parent context
      return await element.evaluate((el: HTMLElement) => {
        const getPath = (element: HTMLElement): string => {
          if (element.id) return `#${element.id}`;
          if (element === document.body) return 'body';

          const parent = element.parentElement;
          if (!parent) return '';

          const index = Array.from(parent.children)
            .filter(child => child.tagName === element.tagName)
            .indexOf(element) + 1;

          return `${getPath(parent)} > ${element.tagName.toLowerCase()}:nth-child(${index})`;
        };
        return getPath(el);
      });
    } catch (error) {
      console.error('Failed to get selector:', error);
      return 'unknown';
    }
  }

  private async getXPath(element: any): Promise<string> {
    try {
      return await element.evaluate((el: Element) => {
        const getPathTo = (element: Element): string => {
          if (element.id !== '')
            return `//*[@id="${element.id}"]`;
          if (element === document.body)
            return '/html/body';

          let ix = 0;
          const siblings = element.parentNode?.children || [];
          for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element)
              return getPathTo(element.parentNode as Element) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
              ix++;
          }
          return '';
        };
        return getPathTo(el);
      });
    } catch (error) {
      console.error('Failed to get XPath:', error);
      return '';
    }
  }

  private recordInteraction(interaction: Omit<Interaction, 'id'>): void {
    const fullInteraction = {
      ...interaction,
      id: uuidv4()
    };
    
    this.interactions.push(fullInteraction);
    console.log('Recorded interaction:', {
      type: fullInteraction.type,
      selector: fullInteraction.selector,
      value: fullInteraction.value
    });
  }

  async stop(): Promise<Interaction[]> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    
    return this.interactions;
  }
} 