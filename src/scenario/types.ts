import { Interaction } from '../interaction/types.js';

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  interactions: Interaction[];
  createdAt: number;
  updatedAt: number;
} 