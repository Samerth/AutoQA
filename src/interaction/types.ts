export enum InteractionType {
  CLICK = 'click',
  INPUT = 'input',
  NAVIGATION = 'navigation',
  SELECT = 'select',
  HOVER = 'hover',
  KEYPRESS = 'keypress'
}

export interface BaseInteraction {
  id: string;
  type: InteractionType;
  timestamp: number;
  url: string;
  selector: string;
  xpath?: string;
  innerText?: string;
}

export interface ClickInteraction extends BaseInteraction {
  type: InteractionType.CLICK;
  button?: 'left' | 'right' | 'middle';
  coordinates?: { x: number; y: number };
  metadata?: {
    tagName: string;
    href?: string;
    type?: string;
    role?: string;
    ariaLabel?: string;
    parent?: {
      tagName: string;
      className?: string;
      id?: string;
    };
    isButton: boolean;
  };
}

export interface InputInteraction extends BaseInteraction {
  type: InteractionType.INPUT;
  value: string;
  previousValue?: string;
}

export interface NavigationInteraction extends BaseInteraction {
  type: InteractionType.NAVIGATION;
  fromUrl: string;
  toUrl: string;
}

export interface KeyPressInteraction extends BaseInteraction {
  type: InteractionType.KEYPRESS;
  key: string;
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
}

export type Interaction = ClickInteraction | InputInteraction | NavigationInteraction | KeyPressInteraction; 