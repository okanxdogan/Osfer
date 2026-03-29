"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReadingDocument } from '@/lib/store/types';
import { ChevronLeft, ZoomIn, ZoomOut, Pen, Eraser, MessageSquareText, FileEdit } from 'lucide-react';
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Tool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'note';
type PenColor = 'black' | 'red' | 'blue' | 'yellow';

type Stroke = {
  tool: Tool;
  color: string;
  points: {x: number, y: number}[];
};

export function ReaderView({ doc, onBack }: { doc: ReadingDocument, onBack: () => void }) {
  const { updateDocumentProgress, updateDocumentAnnotations } = useGlobalStore();
  const [page, setPage] = useState(doc.currentPage || 1);
  const [numPages, setNumPages] = useState(doc.totalPages || 0);
  const [zoom, setZoom] = useState(100);
  const [pdfError, setPdfError] = useState(false);
  
  // Annotation State
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [activeColor, setActiveColor] = useState<PenColor>('black');
  const [pdfHeight, setPdfHeight] = useState<number>(800);
  const [allStrokes, setAllStrokes] = useState<Record<number, Stroke[]>>(doc.annotations || {});

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPdfError(false);
    updateDocumentProgress(doc.id, page, n); // Persist current page and total pages
  }, [doc.id, page, updateDocumentProgress]);

  const onDocumentLoadError = useCallback(() => {
    setPdfError(true);
  }, []);

  const goTo = (p: number) => {
    const clamped = Math.max(1, Math.min(numPages || 999, p));
    setPage(clamped);
    updateDocumentProgress(doc.id, clamped, numPages);
  };

  const pdfWidth = Math.round(800 * (zoom / 100));

  const currentPageStrokes = allStrokes[page] || [];
  const setCurrentPageStrokes = (action: React.SetStateAction<Stroke[]>) => {
    setAllStrokes(prev => {
      const next = typeof action === 'function' ? action(prev[page] || []) : action;
      updateDocumentAnnotations(doc.id, page, next);
      return { ...prev, [page]: next };
    });
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="fixed inset-0 bg-[#0a0a0b] flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-card/40 backdrop-blur-2xl flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <h2 className="font-semibold text-[13px] tracking-tight truncate max-w-[200px] md:max-w-md bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {doc.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1 px-2 mr-2">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"><ZoomOut size={14} /></button>
            <span className="text-[11px] font-bold w-12 text-center tabular-nums text-white/80">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(300, z + 10))} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"><ZoomIn size={14} /></button>
          </div>
        </div>
      </header>

      {/* Reader body */}
      <div className="flex-1 overflow-hidden flex relative min-h-0">
        
        {/* Thumbnail sidebar */}
        {numPages > 0 && (
          <aside className="w-[180px] border-r border-white/5 bg-black/20 hidden lg:flex flex-col items-center py-6 gap-0 overflow-y-auto overflow-x-hidden custom-scrollbar shrink-0 px-4 z-20">
            {doc.fileDataUrl && (
              <Document file={doc.fileDataUrl} loading={<div className="text-[9px] uppercase tracking-widest font-bold text-white/20 mt-10">Loading...</div>}>
                {Array.from({ length: numPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i + 1)}
                    className={`relative w-full mb-5 rounded-xl overflow-hidden border transition-all duration-300 group flex flex-col items-center bg-white/5 shrink-0 ${
                      i + 1 === page 
                        ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] ring-1 ring-primary/50' 
                        : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20 hover:scale-[1.02]'
                    }`}
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <div className="w-full flex justify-center p-1 overflow-hidden pointer-events-none">
                      <Page
                        pageNumber={i + 1}
                        width={130}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={<div className="w-[130px] h-[180px] bg-white/5 animate-pulse" />}
                        className="pointer-events-none overflow-hidden"
                      />
                    </div>
                    <div className={`w-full py-1.5 border-t transition-colors ${i + 1 === page ? 'bg-primary/90 border-white/10' : 'bg-black/60 border-white/5'}`}>
                      <p className="text-[10px] font-black tracking-tighter text-white text-center tabular-nums">{i + 1}</p>
                    </div>
                  </button>
                ))}
              </Document>
            )}
          </aside>
        )}

        {/* Main Workspace */}
        <main className="flex-1 overflow-auto custom-scrollbar flex justify-center py-12 px-8 relative bg-[#0d0d0f]">
          
          {/* Floating Annotation Toolbar — Top Right */}
          <div className="fixed top-20 right-8 z-40 flex flex-col md:flex-row items-center gap-1.5 p-1.5 bg-[#161618]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-1">
              <ToolButton icon={null} label="Select" tool="select" active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
              <div className="w-8 h-[1px] md:w-[1px] md:h-8 bg-white/5 mx-0.5" />
              <ToolButton icon={Pen} label="Pen" tool="pen" active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} />
              <ToolButton icon={FileEdit} label="Highlight" tool="highlighter" active={activeTool === 'highlighter'} onClick={() => setActiveTool('highlighter')} />
              <ToolButton icon={Eraser} label="Eraser" tool="eraser" active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
              <ToolButton icon={MessageSquareText} label="Note" tool="note" active={activeTool === 'note'} onClick={() => setActiveTool('note')} />
            </div>
            
            <AnimatePresence>
              {(activeTool === 'pen' || activeTool === 'highlighter') && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col md:flex-row gap-1.5 pl-1 md:pl-2 border-t md:border-t-0 md:border-l border-white/10 mt-1.5 md:mt-0 pt-1.5 md:pt-0">
                  <ColorDot color="black" current={activeColor} onClick={setActiveColor} hex="bg-zinc-800 dark:bg-zinc-200" />
                  <ColorDot color="red" current={activeColor} onClick={setActiveColor} hex="bg-red-500" />
                  <ColorDot color="blue" current={activeColor} onClick={setActiveColor} hex="bg-blue-500" />
                  {activeTool === 'highlighter' && <ColorDot color="yellow" current={activeColor} onClick={setActiveColor} hex="bg-yellow-400" />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {doc.fileDataUrl ? (
            <div className="relative">
              <Document
                file={doc.fileDataUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="mt-40 w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
              >
                {!pdfError && (
                  <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white rounded-sm overflow-hidden ring-1 ring-white/5">
                    <Page
                      pageNumber={page}
                      width={pdfWidth}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      onRenderSuccess={(p) => setPdfHeight(p.height)}
                      loading={<div style={{ width: pdfWidth, height: pdfWidth * 1.414 }} className="bg-white/5 animate-pulse" />}
                    />
                    <DrawingCanvas 
                      width={pdfWidth} 
                      height={pdfHeight} 
                      mode={activeTool} 
                      color={activeColor} 
                      strokes={currentPageStrokes} 
                      setStrokes={setCurrentPageStrokes} 
                    />
                  </div>
                )}
              </Document>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-40 gap-4 opacity-20">
              <BookOpen size={48} />
              <p className="text-sm font-bold uppercase tracking-[0.2em]">Document Unavailable</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer Pager & Progress */}
      <footer className="h-16 border-t border-white/5 bg-card/40 backdrop-blur-2xl flex items-center justify-center shrink-0 z-30 px-8 relative">
        {/* Progress bar background */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5">
          <motion.div 
            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${(page / numPages) * 100}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => goTo(page - 1)} disabled={page <= 1} className="p-2.5 hover:bg-white/10 rounded-full transition-all disabled:opacity-10 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-[14px] font-black tracking-tight tabular-nums">
              <span className="text-white">{page}</span>
              <span className="text-white/20 mx-1.5">/</span>
              <span className="text-white/40">{numPages || '—'}</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 mt-0.5">Page Progress</span>
          </div>
          <button onClick={() => goTo(page + 1)} disabled={page >= numPages} className="p-2.5 hover:bg-white/10 rounded-full transition-all disabled:opacity-10 disabled:cursor-not-allowed rotate-180"><ChevronLeft size={18} /></button>
        </div>
      </footer>
    </motion.div>
  );
}

// ── Interactive Drawing Canvas Core ──
function DrawingCanvas({
  width, height, mode, color, strokes, setStrokes
}: {
  width: number, height: number, mode: Tool, color: string, strokes: Stroke[], setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPoints, setCurrentPoints] = useState<{x:number, y:number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and match visual size exactly
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawPoints = (pts: {x:number, y:number}[], t: Tool, c: string) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for(let i=1; i<pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      
      if (t === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 24;
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else {
        const hex = c === 'black' ? '#000000' : (c === 'red' ? '#ef4444' : (c === 'blue' ? '#3b82f6' : '#eab308'));
        ctx.strokeStyle = hex;
        ctx.lineWidth = t === 'highlighter' ? 22 : 3;
        ctx.globalAlpha = t === 'highlighter' ? 0.35 : 1.0;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    };

    strokes.forEach(s => drawPoints(s.points, s.tool, s.color));
    if (currentPoints.length > 0) drawPoints(currentPoints, mode, color);
  }, [width, height, strokes, currentPoints, mode, color]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode === 'select' || mode === 'note') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (width / rect.width);
    const y = (e.clientY - rect.top) * (height / rect.height);
    setCurrentPoints([{ x, y }]);
    canvas.setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (currentPoints.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (width / rect.width);
    const y = (e.clientY - rect.top) * (height / rect.height);
    setCurrentPoints(prev => [...prev, { x, y }]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (currentPoints.length > 0) {
      setStrokes(prev => [...prev, { tool: mode, color, points: currentPoints }]);
      setCurrentPoints([]);
      canvasRef.current?.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute inset-0 z-20 touch-none select-none ${mode === 'select' || mode === 'note' ? 'pointer-events-none' : 'cursor-crosshair'}`}
    />
  );
}

// ── Toolbar Subcomponents ──

function ToolButton({ icon: Icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string, tool: string }) {
  const isSelect = label === 'Select';
  return (
    <button 
      onClick={onClick}
      title={label}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-110' 
          : 'text-white/40 hover:bg-white/10 hover:text-white'
      }`}
    >
      {isSelect ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
      ) : (
        <Icon size={18} strokeWidth={2.5} />
      )}
    </button>
  );
}

function ColorDot({ color, hex, current, onClick }: { color: PenColor, hex: string, current: PenColor, onClick: (c: PenColor) => void }) {
  const active = color === current;
  return (
    <button onClick={() => onClick(color)} className="w-9 h-9 flex items-center justify-center group relative">
      <div className={`w-4 h-4 rounded-full ${hex} shadow-lg border border-white/10 transition-all duration-300 ${active ? 'scale-125 ring-2 ring-primary ring-offset-4 ring-offset-[#161618] opacity-100' : 'scale-90 opacity-40 group-hover:opacity-100 group-hover:scale-100'}`} />
    </button>
  );
}

import { BookOpen, Layers } from 'lucide-react';

