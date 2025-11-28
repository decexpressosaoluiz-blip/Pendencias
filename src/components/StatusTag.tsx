import React from 'react';

export const StatusTag = ({ status }: { status: string }) => {
  const getStyle = (s: string) => {
    if (!s) return 'bg-gray-100 text-gray-800';
    const upper = s.toUpperCase();
    if (upper.includes('FORA') || upper.includes('CRÍTICO') || upper.includes('VENCIDO')) 
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
    if (upper.includes('ATENÇÃO') || upper.includes('AMANHÃ') || upper.includes('PRIORIDADE')) 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
  };
  
  const label = status.replace('_', ' ');

  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getStyle(status)}`}>{label}</span>;
};