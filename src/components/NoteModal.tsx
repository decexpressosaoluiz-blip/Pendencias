
import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Save, User as UserIcon, Calendar, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { CameraModal } from './CameraModal';
import { PendingItem, User, Note } from '../types';
import { getNotes } from '../services/dataService';

interface NoteModalProps {
  item: PendingItem;
  currentUser: User;
  onClose: () => void;
  onSave: (note: string, image: string | undefined) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ item, currentUser, onClose, onSave }) => {
  const [noteText, setNoteText] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | undefined>(undefined);
  const [showCamera, setShowCamera] = useState(false);
  const [existingNotes, setExistingNotes] = useState<Note[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allNotes = getNotes();
    const relevant = allNotes.filter(n => n.cte === item.cte && n.serie === item.serie);
    // Sort by timestamp (oldest first for chat-like history)
    relevant.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setExistingNotes(relevant);
  }, [item]);

  useEffect(() => {
    // Auto-scroll to bottom when notes load
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [existingNotes]);

  const handleSave = () => {
    if (!noteText.trim()) {
      alert("A anotação é obrigatória.");
      return;
    }
    onSave(noteText, capturedImage);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      {showCamera && (
        <CameraModal 
          onCapture={(img) => { setCapturedImage(img); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
      
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-black/20 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Justificar Pendência</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">CTE: {item.cte} | Série: {item.serie}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        
        {/* History / Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-black/10 space-y-4">
          {existingNotes.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nenhuma anotação anterior.
            </div>
          )}
          
          {existingNotes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-primary dark:text-blue-400">{note.user}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10} /> {new Date(note.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{note.content}</p>
              {note.imageUrl && (
                <div className="mt-2">
                  <img src={note.imageUrl} alt="Evidência" className="h-20 w-auto rounded border dark:border-slate-600 cursor-pointer hover:opacity-90" onClick={() => window.open(note.imageUrl, '_blank')} />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-slate-700 shrink-0">
          <div className="space-y-3">
            <div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none min-h-[80px] placeholder-slate-400 text-sm"
                placeholder="Escreva uma nova justificativa..."
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowCamera(true)} icon={<Camera size={16} />}>
                  {capturedImage ? 'Foto Anexada' : 'Foto'}
                </Button>
                {capturedImage && (
                  <div className="relative w-8 h-8 rounded overflow-hidden border dark:border-slate-600 group">
                    <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setCapturedImage(undefined)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={handleSave} icon={<Save size={16} />}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
