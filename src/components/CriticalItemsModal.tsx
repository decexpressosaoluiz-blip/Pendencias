import React from 'react';
import { StalledItem } from '../types';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface CriticalItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StalledItem[];
}

export const CriticalItemsModal: React.FC<CriticalItemsModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-red-200 dark:border-red-900 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/50 flex justify-between items-center bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
               <AlertTriangle className="text-red-600 dark:text-neon-red" size={24} />
            </div>
            <div>
               <h3 className="text-lg font-bold text-red-800 dark:text-white">Mercadorias Críticas</h3>
               <p className="text-sm text-red-600 dark:text-red-300">Itens parados há mais de 10 dias do prazo limite</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-0">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 uppercase font-bold text-xs sticky top-0">
              <tr>
                <th className="p-4 whitespace-nowrap">Nota / CTE</th>
                <th className="p-4 whitespace-nowrap">Cliente</th>
                <th className="p-4 whitespace-nowrap">Origem</th>
                <th className="p-4 whitespace-nowrap">Destino</th>
                <th className="p-4 whitespace-nowrap">Vencimento</th>
                <th className="p-4 whitespace-nowrap text-right">Dias Parado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma mercadoria crítica encontrada.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors">
                    <td className="p-4 font-medium">
                      <div>{item.cte}</div>
                      <div className="text-xs text-slate-400">Série: {item.serie}</div>
                    </td>
                    <td className="p-4 max-w-[200px] truncate" title={item.destinatario}>
                        {item.destinatario}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">{item.coleta}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">{item.entrega}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-red-600 dark:text-red-400 font-medium">
                        {item.dataLimite}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right font-bold text-red-700 dark:text-neon-red">
                        +{item.daysStalled} dias
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
};