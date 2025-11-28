export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export type PaymentType = 'CIF' | 'FOB' | 'FATURAR_DEST' | 'FATURAR_REMETENTE';

export interface User {
  id: string;
  username: string; 
  password: string;
  role: UserRole;
  unitOrigin: string; // Matches Col H (Coleta)
  unitDestination: string; // Matches Col I (Entrega)
}

export interface PendingItem {
  cte: string;         // A
  serie: string;       // B
  codigo: string;      // C
  dataEmissao: string; // D
  prazoBaixa: number;  // E
  dataLimite: string;  // F
  status: string;      // G
  coleta: string;      // H (Unidade Origem)
  entrega: string;     // I (Unidade Destino)
  valorCte: number;    // J
  txEntrega: number;   // K
  volumes: number;     // L
  peso: number;        // M
  fretePago: string;   // N (Should match PaymentType)
  destinatario: string;// O
  justificativaOriginal: string; // P
  
  // Computed fields
  computedStatus?: 'FORA_PRAZO' | 'PRIORIDADE' | 'VENCE_AMANHA' | 'NO_PRAZO';
  hasNotes?: boolean;
  noteCount?: number;
}

export interface StalledItem extends PendingItem {
  daysStalled: number;
}

export interface Note {
  id: string;
  cte: string;
  serie: string;
  user: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  originUnit: string;
  destinationUnit: string;
  isReadByOrigin: boolean;
}

export interface SheetConfig {
  scriptUrl: string;
  lastSync: string;
}

export interface DateReference {
  today: Date;
  tomorrow: Date;
  limit: Date;
}

export interface DesignSystem {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  mood: string;
}

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  bodyText: string;
  cta: string;
}