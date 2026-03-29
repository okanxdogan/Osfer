"use client";
import React, { useState, useRef } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { DocumentCard } from '@/components/modules/read/DocumentCard';
import { ReaderView } from '@/components/modules/read/ReaderView';
import { ReadingDocument } from '@/lib/store/types';
import { UploadCloud, BookOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const uid = () => Math.random().toString(36).substring(2, 9);
const coverColors = ['#4f46e5', '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function ReadPage() {
  const { documents, addDocument, deleteDocument } = useGlobalStore();
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDoc = activeDocId ? documents.find(d => d.id === activeDocId) || null : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.type !== 'application/pdf') return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const doc: ReadingDocument = {
          id: uid(),
          title: file.name.replace('.pdf', ''),
          totalPages: 0, // Will be set by react-pdf after loading
          currentPage: 1,
          lastOpened: Date.now(),
          coverColor: coverColors[documents.length % coverColors.length],
          fileDataUrl: dataUrl,
        };
        addDocument(doc);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10 relative">
      <AnimatePresence>
        {activeDoc && (
          <ReaderView
            key="reader"
            doc={activeDoc}
            onBack={() => setActiveDocId(null)}
          />
        )}
      </AnimatePresence>

      <PageHeader title="Documents" description="Your personal library of PDFs and documents." />

      <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFileUpload} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <GlassCard
          delay={0}
          onClick={() => fileInputRef.current?.click()}
          className="border-dashed border-2 border-border/40 h-[17rem] hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 bg-muted/30 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary rounded-full flex items-center justify-center mb-4 transition-colors">
              <UploadCloud size={26} strokeWidth={1.8} />
            </div>
            <motion.h3 whileHover={{ scale: 1.05 }} className="text-base font-semibold mb-1.5 origin-left cursor-default">Upload PDF</motion.h3>
            <motion.p whileHover={{ scale: 1.02 }} className="text-muted-foreground/60 text-xs max-w-[180px] leading-relaxed origin-left cursor-default">Select a PDF file to add it to your library.</motion.p>
          </div>
        </GlassCard>

        {documents.map((doc, i) => (
          <DocumentCard key={doc.id} doc={doc} delay={(i + 1) * 0.08} onClick={() => setActiveDocId(doc.id)} onDelete={() => deleteDocument(doc.id)} />
        ))}

        {documents.length === 0 && (
          <GlassCard delay={0.1} className="sm:col-span-1 md:col-span-2 lg:col-span-3 h-[17rem]">
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-10">
              <BookOpen size={36} strokeWidth={1.5} className="text-muted-foreground/30 mb-4" />
              <motion.p whileHover={{ scale: 1.05 }} className="text-sm font-medium text-muted-foreground/60 cursor-default">Your library is empty. Upload your first PDF to begin working.</motion.p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
