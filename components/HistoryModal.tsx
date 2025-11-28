import React from 'react';
import { X, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { Note } from '../types';

interface HistoryModalProps {
  cte: string;
  serie: string;
  notes: Note[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ cte, serie, notes, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-black/20">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Histórico de Anotações</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">CTE: {cte} | Série: {serie}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-light-bg dark:bg-dark-bg">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <p>Nenhum histórico encontrado para este documento.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 pb-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white dark:border-dark-bg shadow-sm"></div>
                <div className="bg-white dark:bg-dark-surface p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><User size={12} /> {note.user}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-sm whitespace-pre-wrap">{note.content}</p>
                  
                  {note.imageUrl && (
                    <div className="mt-3">
                       <div className="flex items-center gap-2 text-xs text-primary dark:text-blue-400 mb-1">
                          <ImageIcon size={14} /> <span>Imagem Anexada</span>
                       </div>
                       <img src={note.imageUrl} alt="Anexo" className="max-h-40 rounded border dark:border-slate-600 shadow-sm" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};