import React, { useState } from 'react';
import { X, Camera, Save } from 'lucide-react';
import { Button } from './Button';
import { CameraModal } from './CameraModal';
import { PendingItem, User } from '../types';

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
      
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-black/20">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Justificar Pendência</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">CTE: {item.cte} | Série: {item.serie}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nota / Justificativa <span className="text-red-500">*</span>
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-bg text-slate-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none min-h-[120px] placeholder-slate-400"
              placeholder="Descreva o motivo ou ação tomada..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Evidência (Opcional)
            </label>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => setShowCamera(true)} icon={<Camera size={18} />}>
                {capturedImage ? 'Alterar Foto' : 'Tirar Foto'}
              </Button>
              {capturedImage && (
                <div className="relative w-16 h-16 rounded overflow-hidden border dark:border-slate-600">
                  <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setCapturedImage(undefined)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-black/20 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} icon={<Save size={18} />}>
            Salvar Justificativa
          </Button>
        </div>
      </div>
    </div>
  );
};