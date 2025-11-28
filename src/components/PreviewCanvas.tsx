import React, { useRef, useState } from 'react';
import { DesignSystem, GeneratedContent } from '../types';
import { DraggableImage } from './DraggableImage';
import html2canvas from 'html2canvas';
import { Download, Layout, Monitor, Smartphone, Tablet } from 'lucide-react';
import { getContrastColor, hexToRgba } from '../utils/colorUtils';

interface PreviewCanvasProps {
  designSystem: DesignSystem;
  content: GeneratedContent;
  uploadedImages: string[];
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  designSystem,
  content,
  uploadedImages
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<number>(0);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = await html2canvas(canvasRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `gemini-design-layout-${layout}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const { colors, fonts } = designSystem;

  const renderLayout = () => {
    switch (layout) {
      case 0: // Hero Split Left
        return (
          <div className="grid grid-cols-2 h-full w-full">
            <div className="p-16 flex flex-col justify-center gap-8" style={{ backgroundColor: colors.background }}>
              <h1 style={{ color: colors.primary, fontFamily: fonts.heading }} className="text-6xl font-black leading-tight tracking-tight">
                {content.headline}
              </h1>
              <p style={{ color: colors.text, fontFamily: fonts.body }} className="text-xl opacity-90 leading-relaxed font-light">
                {content.subheadline}
              </p>
              <button 
                className="px-8 py-4 rounded-lg font-bold w-fit transition-transform hover:translate-x-2 shadow-lg"
                style={{ backgroundColor: colors.accent, color: getContrastColor(colors.accent) }}
              >
                {content.cta}
              </button>
            </div>
            <div className="relative overflow-hidden flex items-center justify-center p-12" style={{ backgroundColor: colors.secondary }}>
               <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{ backgroundImage: `radial-gradient(circle, ${colors.primary} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
               <div className="w-64 h-64 border-8 opacity-20 absolute top-10 right-10 rounded-full" style={{ borderColor: colors.background }}></div>
            </div>
          </div>
        );
      case 1: // Centered Minimal
        return (
          <div className="flex flex-col items-center justify-center h-full p-20 text-center relative w-full" style={{ backgroundColor: colors.background }}>
            <span style={{ color: colors.accent, fontFamily: fonts.body }} className="uppercase tracking-[0.3em] text-sm font-bold mb-6">{designSystem.mood} EXPERIENCE</span>
            <h1 style={{ color: colors.text, fontFamily: fonts.heading }} className="text-7xl font-bold mb-8 max-w-4xl leading-none">
                {content.headline}
            </h1>
            <p style={{ color: colors.secondary, fontFamily: fonts.body }} className="text-2xl max-w-xl mb-10 font-light">
                {content.subheadline}
            </p>
            <button 
                className="px-12 py-4 rounded-full font-bold border-2 transition-all hover:bg-opacity-10"
                style={{ borderColor: colors.primary, color: colors.primary }}
            >
                {content.cta}
            </button>
          </div>
        );
      case 2: // Dark Mode Cyber
        return (
          <div className="h-full flex flex-col justify-between p-16 relative w-full overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
             <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-40" style={{ backgroundColor: colors.primary }}></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30" style={{ backgroundColor: colors.accent }}></div>
             
             <div className="z-10 relative">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-px w-12 bg-white/50"></div>
                    <span className="text-white/70 font-mono text-sm uppercase">{designSystem.mood}</span>
                 </div>
                <h1 style={{ color: 'white', fontFamily: fonts.heading, textShadow: `0 0 40px ${hexToRgba(colors.primary, 0.5)}` }} className="text-8xl font-black max-w-4xl leading-[0.9]">
                    {content.headline}
                </h1>
             </div>
             
             <div className="z-10 flex items-end justify-between border-t border-white/10 pt-8">
                 <p className="text-gray-400 max-w-md font-mono text-sm leading-relaxed">{content.bodyText}</p>
                 <button 
                    className="px-10 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                 >
                    {content.cta}
                 </button>
             </div>
          </div>
        );
      case 3: // Typographic Big
        return (
           <div className="h-full p-16 flex flex-col w-full relative" style={{ backgroundColor: colors.primary }}>
              <h1 className="text-[12rem] leading-[0.85] font-black opacity-30 absolute -right-20 top-20 pointer-events-none select-none overflow-hidden whitespace-nowrap" style={{ color: colors.background, fontFamily: fonts.heading }}>
                  {content.headline.split(' ')[0]}
              </h1>
              <div className="flex-1 flex flex-col justify-end z-10">
                 <h2 className="text-6xl font-bold mb-6 max-w-2xl" style={{ color: colors.background, fontFamily: fonts.heading }}>{content.headline}</h2>
                 <div className="h-2 w-32 mb-8" style={{ backgroundColor: colors.accent }}></div>
                 <p className="text-xl max-w-lg mb-8 font-medium" style={{ color: getContrastColor(colors.primary) }}>{content.bodyText}</p>
                 <button className="bg-black text-white px-8 py-4 w-fit font-bold uppercase tracking-widest hover:bg-gray-900">{content.cta}</button>
              </div>
           </div>
        );
      case 4: // Split Diagonal
        return (
           <div className="h-full relative overflow-hidden w-full" style={{ backgroundColor: colors.background }}>
              <div className="absolute top-0 right-0 w-[55%] h-full transform skew-x-[-12deg] origin-bottom-right" style={{ backgroundColor: colors.secondary }}></div>
              <div className="absolute inset-0 flex items-center p-20 z-10 w-full">
                 <div className="w-1/2 pr-12">
                    <h1 className="text-7xl font-bold mb-8 drop-shadow-sm" style={{ color: colors.text, fontFamily: fonts.heading }}>{content.headline}</h1>
                    <button className="px-8 py-4 rounded-xl shadow-xl font-bold transform hover:-translate-y-1 transition-transform" style={{ backgroundColor: colors.primary, color: getContrastColor(colors.primary) }}>{content.cta}</button>
                 </div>
                 <div className="w-1/2 pl-16 text-right flex flex-col items-end">
                    <h2 className="text-4xl font-light mb-6" style={{ color: getContrastColor(colors.secondary), fontFamily: fonts.body }}>{content.subheadline}</h2>
                    <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center" style={{ borderColor: colors.accent }}>
                        <span className="text-2xl" style={{ color: getContrastColor(colors.secondary) }}>Go</span>
                    </div>
                 </div>
              </div>
           </div>
        );
      case 5: // Magazine Grid
        return (
            <div className="h-full p-12 bg-white w-full grid grid-cols-12 grid-rows-6 gap-4" style={{ backgroundColor: colors.background }}>
                <div className="col-span-8 row-span-4 bg-gray-100 rounded-3xl relative overflow-hidden" style={{ backgroundColor: colors.secondary }}>
                    <div className="absolute inset-0 flex items-center justify-center text-opacity-20 text-9xl font-bold select-none" style={{ color: colors.primary }}>IMG</div>
                </div>
                <div className="col-span-4 row-span-2 rounded-3xl p-6 flex flex-col justify-center" style={{ backgroundColor: colors.primary }}>
                    <h2 className="text-3xl font-bold leading-tight" style={{ color: getContrastColor(colors.primary), fontFamily: fonts.heading }}>{content.subheadline}</h2>
                </div>
                <div className="col-span-4 row-span-4 rounded-3xl border-2 flex flex-col justify-between p-8" style={{ borderColor: colors.text }}>
                    <div className="text-6xl">✻</div>
                    <p style={{ fontFamily: fonts.body, color: colors.text }}>{content.bodyText}</p>
                </div>
                <div className="col-span-8 row-span-2 flex items-center justify-between p-4">
                     <h1 className="text-5xl font-bold" style={{ color: colors.text, fontFamily: fonts.heading }}>{content.headline}</h1>
                     <button className="rounded-full px-8 py-8 font-bold text-sm uppercase" style={{ backgroundColor: colors.accent, color: getContrastColor(colors.accent) }}>{content.cta}</button>
                </div>
            </div>
        );
      case 6: // Brutalist
        return (
            <div className="h-full w-full border-8 p-8 flex flex-col relative" style={{ borderColor: colors.text, backgroundColor: colors.background }}>
                <div className="absolute top-8 right-8 bg-black text-white px-4 py-2 font-mono text-xs uppercase transform rotate-2">
                    {designSystem.mood} GEN
                </div>
                <div className="flex-1 flex items-center">
                    <h1 className="text-8xl font-black uppercase leading-none break-words w-full" style={{ color: colors.text, fontFamily: fonts.heading }}>
                        {content.headline}
                    </h1>
                </div>
                <div className="grid grid-cols-2 border-t-4 pt-8 gap-8" style={{ borderColor: colors.text }}>
                    <p className="text-xl font-bold leading-none" style={{ color: colors.secondary, fontFamily: fonts.body }}>
                        {content.subheadline}
                    </p>
                    <button 
                        className="w-full py-4 text-center font-bold uppercase border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        style={{ backgroundColor: colors.primary, color: getContrastColor(colors.primary), borderColor: colors.text }}
                    >
                        {content.cta}
                    </button>
                </div>
            </div>
        );
      default:
        return <div>Layout not found</div>;
    }
  };

  const getContainerStyle = () => {
    switch (deviceMode) {
      case 'mobile': return 'w-[375px] h-[667px]';
      case 'tablet': return 'w-[768px] h-[1024px]';
      default: return 'w-[1280px] h-[720px]';
    }
  };

  return (
    <div className="flex-1 bg-slate-100 flex flex-col items-center relative overflow-hidden h-full">
        {/* Toolbar */}
        <div className="w-full bg-white border-b border-slate-200 p-3 px-8 flex justify-between items-center shadow-sm z-20">
            <div className="flex gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 self-center">Layouts</span>
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <button 
                        key={i}
                        onClick={() => setLayout(i)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${layout === i ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setDeviceMode('desktop')} className={`p-2 rounded-md ${deviceMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}><Monitor size={18} /></button>
                    <button onClick={() => setDeviceMode('tablet')} className={`p-2 rounded-md ${deviceMode === 'tablet' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}><Tablet size={18} /></button>
                    <button onClick={() => setDeviceMode('mobile')} className={`p-2 rounded-md ${deviceMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}><Smartphone size={18} /></button>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <button 
                    onClick={handleDownload} 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                    <Download size={16} />
                    Exportar
                </button>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 w-full overflow-auto flex items-center justify-center p-12 bg-slate-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div 
                ref={canvasRef}
                className={`${getContainerStyle()} bg-white shadow-2xl relative transition-all duration-500 flex-shrink-0 overflow-hidden`}
            >
                {renderLayout()}
                
                {/* Image Overlay Layer */}
                <div className="absolute inset-0 pointer-events-none z-50">
                    {uploadedImages.map((src, idx) => (
                         <div key={idx} className="pointer-events-auto">
                            <DraggableImage src={src} initialX={100 + (idx * 40)} initialY={100 + (idx * 40)} containerRef={canvasRef} />
                         </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};