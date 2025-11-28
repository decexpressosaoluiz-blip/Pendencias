import React from 'react';

interface StatusTagProps {
  status: 'FORA_PRAZO' | 'PRIORIDADE' | 'VENCE_AMANHA' | 'NO_PRAZO';
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const styles = {
    FORA_PRAZO: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-neon-red dark:border-red-500 dark:glow-border-red",
    PRIORIDADE: "bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold dark:bg-yellow-900/30 dark:text-neon-yellow dark:border-yellow-500",
    VENCE_AMANHA: "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-700",
    NO_PRAZO: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700"
  };

  const labels = {
    FORA_PRAZO: "FORA DO PRAZO",
    PRIORIDADE: "PRIORIDADE",
    VENCE_AMANHA: "VENCE AMANHÃ",
    NO_PRAZO: "NO PRAZO"
  };

  return (
    <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold shadow-sm ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};