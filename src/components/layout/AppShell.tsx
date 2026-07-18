"use client";
import React from 'react';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main
        className="flex-1 w-full relative overflow-y-scroll"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.18) transparent' }}
      >
        <style>{`
          main::-webkit-scrollbar { width: 6px; }
          main::-webkit-scrollbar-track { background: transparent; }
          main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 9999px; }
          main::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.32); }
        `}</style>
        <div className="mx-auto max-w-7xl p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
