import React from 'react';
import { DesignSystem, GeneratedContent } from '../types';
import { Palette, Type, Wand2, Upload, Trash2 } from 'lucide-react';

interface EditorSidebarProps {
  prompt: string;
  setPrompt: (s: string) => void;
  onGenerate: () => void;
  loading: boolean;
  designSystem: DesignSystem | null;
  content: GeneratedContent | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedImages: string[];
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  loading,
  designSystem,
  content,
  onImageUpload,
  uploadedImages
}) => {
  return (
    <div className="w-96 bg-white border-r border-slate-200 h-full flex flex-col overflow-y-auto z-10 shadow-lg relative">
      <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
          Gemini Engine
        </h1>
        <p className="text-xs text-slate-500 font-medium">DESIGN GENERATOR v2.5</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        
        {/* Prompt Section */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Wand2 size={16} className="text-blue-500" />
            Prompt Criativo
          </label>
          <textarea
            className="w-full p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-slate-50 text-slate-700 min-h-[120px] shadow-inner"
            placeholder="Ex: Uma landing page futurista para uma marca de carros elétricos, com tons neon e fundo escuro..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={onGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Gerando...
              </span>
            ) : (
              <>
                <Wand2 size={18} />
                Gerar Design
              </>
            )}
          </button>
        </div>

        <div className="h-px bg-slate-100"></div>

        {/* Upload Section */}
        <div className="space-y-3">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Upload size={16} className="text-blue-500" />
                Upload de Imagens
            </label>
            <div className="grid grid-cols-3 gap-3">
                {uploadedImages.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative group shadow-sm bg-white">
                        <img src={img} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2 size={16} className="text-white cursor-pointer" />
                        </div>
                    </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-all gap-1">
                    <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                    <Upload size={20} />
                    <span className="text-[10px] font-medium">Add</span>
                </label>
            </div>
        </div>

        {designSystem && (
          <div className="animate-fade-in space-y-8">
            <div className="h-px bg-slate-100"></div>
            
            {/* Colors Section */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Palette size={16} className="text-purple-500" />
                Paleta Gerada
              </label>
              <div className="flex flex-wrap gap-3">
                {Object.entries(designSystem.colors).map(([key, color]) => (
                  <div key={key} className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div 
                        className="w-12 h-12 rounded-full shadow-md border border-white ring-2 ring-transparent group-hover:ring-slate-200 transition-all scale-100 group-hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={`${key}: ${color}`}
                    ></div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{key.substring(0,4)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Type size={16} className="text-orange-500" />
                Tipografia
              </label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Heading</p>
                    <div className="text-xl font-bold text-slate-800 leading-tight" style={{ fontFamily: designSystem.fonts.heading }}>
                        {designSystem.fonts.heading}
                    </div>
                </div>
                <div className="h-px bg-slate-200"></div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Body</p>
                    <div className="text-sm text-slate-600" style={{ fontFamily: designSystem.fonts.body }}>
                        {designSystem.fonts.body}
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                <span className="font-semibold">Mood Detected:</span>
                <span className="uppercase tracking-wide">{designSystem.mood}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};