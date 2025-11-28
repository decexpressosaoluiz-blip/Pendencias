export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string; // CPF or Name
  password: string;
  role: UserRole;
  unitDestination: string; // Unidade de Destino (Col I)
  unitOrigin: string; // Unidade de Origem (Col H)
}

export interface PendingItem {
  cte: string;         // A
  serie: string;       // B
  codigo: string;      // C
  dataEmissao: string; // D (YYYY-MM-DD)
  prazoBaixa: number;  // E
  dataLimite: string;  // F (Calculated or from sheet)
  status: string;      // G
  coleta: string;      // H (Unidade Origem)
  entrega: string;     // I (Unidade Destino)
  valorCte: number;    // J
  txEntrega: number;   // K
  volumes: number;     // L
  peso: number;        // M
  fretePago: string;   // N
  destinatario: string;// O
  justificativaOriginal: string; // P
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
  originUnit: string; // To notify origin
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