import { PendingItem, Note, User, UserRole, StalledItem, SheetConfig } from '../types';
import { calculateStatus, getDateReference, parseDate, addDays, formatDate, isStalled } from './dateUtils';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQ8UNcdAqoRc-uNCR-rQJuW24F4vY0YOYiNcdI6wvTacaakqmsFR05JnSmXG4FL-IcwhOPsH0oK4fH/pub?output=csv';

const STORAGE_KEYS = {
  USERS: 'controllog_users',
  NOTES: 'controllog_notes',
  CONFIG: 'controllog_config'
};

const INITIAL_ADMIN: User = {
  id: 'admin',
  username: 'admin',
  password: '123', 
  role: UserRole.ADMIN,
  unitDestination: '',
  unitOrigin: ''
};

// --- CONFIGURATION ---
export const getScriptUrl = (): string => {
  try {
      const config = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return config ? JSON.parse(config).scriptUrl : '';
  } catch {
      return '';
  }
};

export const saveScriptUrl = (url: string) => {
  const config = { scriptUrl: url, lastSync: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

// Helper to send data to Apps Script
const syncToSheet = async (action: 'createUser' | 'deleteUser' | 'saveNote', payload: any) => {
  const url = getScriptUrl();
  if (!url) return;
  
  try {
    // no-cors mode allows sending data without reading response (which is blocked by CORS usually for GAS)
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    console.log(`Synced ${action} to sheet`);
  } catch (error) {
    console.error("Failed to sync to sheet:", error);
  }
};

export const initializeData = () => {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!users) {
      // Seed Admin
      const adminWithPass = { ...INITIAL_ADMIN, password: '02965740155' }; // Default password
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminWithPass]));
    }
  } catch (e) {
    console.error("Error initializing data", e);
  }
};

// --- USERS ---
export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveUser = (user: User) => {
  const users = getUsers();
  if (user.username) {
    user.username = user.username.toLowerCase();
  }
  
  const existingIndex = users.findIndex(u => u.username === user.username);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Sync to Sheet
  syncToSheet('createUser', user);
};

export const deleteUser = (username: string) => {
  const users = getUsers().filter(u => u.username !== username);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Sync to Sheet
  syncToSheet('deleteUser', { username });
};

// --- NOTES ---
export const getNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveNote = (note: Note) => {
  const notes = getNotes();
  notes.push(note);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  
  // Sync to Sheet
  syncToSheet('saveNote', note);
};

export const getNotesByCTE = (cte: string, serie: string): Note[] => {
  const notes = getNotes();
  return notes.filter(n => n.cte === cte && n.serie === serie);
};

export const getInboxNotes = (originUnit: string): Note[] => {
  const notes = getNotes();
  if (!originUnit) return [];
  return notes.filter(n => n.originUnit === originUnit);
};

// --- PENDING ITEMS (CSV) ---
export const fetchPendingItems = async (): Promise<{ items: PendingItem[], uniqueUnits: string[], stalledItems: StalledItem[] }> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("Failed CSV");
    const text = await response.text();
    
    if (!text || text.trim().length === 0) return { items: [], uniqueUnits: [], stalledItems: [] };

    const rows = text.split('\n').map(row => row.split(','));
    
    const items: PendingItem[] = [];
    const stalledItems: StalledItem[] = [];
    const uniqueUnits = new Set<string>();
    
    const notes = getNotes();
    const dateRefs = getDateReference();

    // Skip header (i=1)
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].map(c => c.replace(/\r/g, '').trim());
      if (cols.length < 5) continue;

      const cte = cols[0];
      const serie = cols[1];
      const dataEmissaoStr = cols[3];
      const prazoBaixa = Number(cols[4]);

      let dataLimiteStr = cols[5]; 
      const emissaoDate = parseDate(dataEmissaoStr);
      if (emissaoDate && !isNaN(prazoBaixa)) {
        const calculatedLimit = addDays(emissaoDate, prazoBaixa);
        dataLimiteStr = formatDate(calculatedLimit);
      }

      if (cols[7]) uniqueUnits.add(cols[7]); // Origin
      if (cols[8]) uniqueUnits.add(cols[8]); // Dest

      // Check notes
      const itemNotes = notes.filter(n => n.cte === cte && n.serie === serie);
      const noteCount = itemNotes.length;

      const item: PendingItem = {
        cte: cols[0],
        serie: cols[1],
        codigo: cols[2],
        dataEmissao: dataEmissaoStr,
        prazoBaixa: prazoBaixa,
        dataLimite: dataLimiteStr,
        status: cols[6],
        coleta: cols[7],
        entrega: cols[8],
        valorCte: Number(cols[9]),
        txEntrega: Number(cols[10]),
        volumes: Number(cols[11]),
        peso: Number(cols[12]),
        fretePago: cols[13],
        destinatario: cols[14],
        justificativaOriginal: cols[15],
        hasNotes: noteCount > 0,
        noteCount
      };

      item.computedStatus = calculateStatus(item, dateRefs);
      
      if (isStalled(item)) {
        const limitDate = parseDate(item.dataLimite) || new Date();
        const daysStalled = Math.floor((new Date().getTime() - limitDate.getTime()) / (1000 * 3600 * 24));
        stalledItems.push({ ...item, daysStalled });
      }

      items.push(item);
    }
    
    return { 
      items, 
      uniqueUnits: Array.from(uniqueUnits).sort(),
      stalledItems
    };
  } catch (error) {
    console.error("Failed to fetch CSV", error);
    return { items: [], uniqueUnits: [], stalledItems: [] };
  }
};