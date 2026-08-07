"use client";
import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { MONTHS_TR } from './calendarUtils';

export type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onNewEvent,
}: CalendarHeaderProps) {
  const monthName = MONTHS_TR[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card/60 border border-border/40 p-4 rounded-2xl backdrop-blur-md">
      {/* Date controls */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground tracking-tight min-w-40">
          {monthName} <span className="text-primary font-light">{year}</span>
        </h2>

        <div className="flex items-center gap-1 bg-background/50 border border-border/40 p-1 rounded-xl">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Önceki"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1 text-xs font-semibold text-foreground hover:text-primary transition-colors"
          >
            Bugün
          </button>
          <button
            onClick={onNext}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Sonraki"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* View Switcher & Action */}
      <div className="flex items-center gap-3">
        <div className="flex items-center p-1 bg-background/50 border border-border/40 rounded-xl">
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'month'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Ay
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'week'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hafta
          </button>
          <button
            onClick={() => onViewModeChange('day')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'day'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Gün
          </button>
        </div>

        <button
          onClick={onNewEvent}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 transition-all shadow-md"
        >
          <Plus size={16} /> Etkinlik Ekle
        </button>
      </div>
    </div>
  );
}