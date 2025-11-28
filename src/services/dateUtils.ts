import { DateReference, PendingItem } from '../types';

export const getDateReference = (): DateReference => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const limit = new Date(today);
  limit.setDate(limit.getDate() + 2);

  return { today, tomorrow, limit };
};

export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d || isNaN(d.getTime())) return typeof date === 'string' ? date : '';
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const calculateStatus = (item: PendingItem, refs: DateReference): 'FORA_PRAZO' | 'PRIORIDADE' | 'VENCE_AMANHA' | 'NO_PRAZO' => {
  const limitDate = parseDate(item.dataLimite);
  
  if (!limitDate) return 'NO_PRAZO';
  limitDate.setHours(0,0,0,0);
  const { today, tomorrow } = refs;

  if (limitDate.getTime() < today.getTime()) {
    return 'FORA_PRAZO';
  }
  if (limitDate.getTime() === today.getTime()) {
    return 'PRIORIDADE';
  }
  if (limitDate.getTime() > today.getTime() && limitDate.getTime() === tomorrow.getTime()) {
    return 'VENCE_AMANHA';
  }
  return 'NO_PRAZO';
};

export const isStalled = (item: PendingItem): boolean => {
  const limitDate = parseDate(item.dataLimite);
  if (!limitDate) return false;
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const stalledThreshold = addDays(limitDate, 10);
  
  return today.getTime() > stalledThreshold.getTime();
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const getCurrentDate = (): string => {
  return new Date().toISOString();
};