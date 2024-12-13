export enum InteractionType {
  CLICK = 'click',
  INPUT = 'input',
  FILE_UPLOAD = 'fileUpload'
}

export interface Interaction {
  id: string;
  type: InteractionType;
  selector: string;
  value?: string;
  timestamp: number;
} 