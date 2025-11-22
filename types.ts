export enum FilterType {
  NORMAL = 'Normal',
  VINTAGE = 'Vintage',
  BW = 'B&W',
  COOL = 'Cool',
  WARM = 'Warm',
  FADED = 'Faded',
  DRAMATIC = 'Dramatic',
  VELVIA = 'Velvia',
  CHROME = 'Chrome',
  INSTAX = 'Instax'
}

export interface FilterConfig {
  name: FilterType;
  class: string; // Tailwind classes or custom style adjustments
  cssFilter: string; // Raw CSS filter string for canvas drawing
}

export interface PolaroidData {
  id: string;
  imageData: string; // Base64
  timestamp: number;
  caption: string;
  filter: FilterType;
}

export type CameraMode = 'capture' | 'upload';
export type AppState = 'idle' | 'developing' | 'editing' | 'gallery';