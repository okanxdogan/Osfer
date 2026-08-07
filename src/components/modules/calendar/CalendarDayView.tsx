"use client";
import React from 'react';
import { formatDateISO, MONTHS_TR, DAYS_TR, CATEGORY_COLORS } from './calendarUtils';
import { CalendarEvent } from '@/lib/store/types';
import { Clock, Plus, Trash2 } from 'lucide-react';

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onNewEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export function CalendarDayView({
  currentDate,
  events,
  onNewEvent,
  onEventClick,
  onDeleteEvent,
}: CalendarDayViewProps) {
  const dateStr = formatDateISO(currentDate);
  const dayEvents = events.filter((e) => e.date === dateStr);

  const dayName = DAYS_TR[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
  const monthName = MONTHS_TR[currentDate.getMonth()];

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Day Overview Header */}
      <div className="flex items-center justify-between p-5 bg-card/60 border border-border/40 rounded-2xl backdrop-blur-md">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider">
            {dayName}, {currentDate.getDate()} {monthName} {currentDate.getFullYear()}
          </div>
          <h3 className="text-lg font-bold text-foreground mt-0.5">
            Günün Programı ({dayEvents.length} Etkinlik)
          </h3>
        </div>

        <button
          onClick={onNewEvent}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 transition-all shadow-md"
        >
          <Plus size={16} /> Etkinlik Ekle
        </button>
      </div>

      {/* Events List */}
      <div className="flex-1 bg-card/40 border border-border/40 rounded-2xl p-4 overflow-y-auto max-h-[600px] custom-scrollbar">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock size={36} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">
              Bu gün için henüz bir etkinlik eklenmedi.
            </p>
            <button
              onClick={onNewEvent}
              className="mt-3 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors"
            >
              + Etkinlik Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((evt) => {
              const catInfo = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.study;

              return (
                <div
                  key={evt.id}
                  onClick={() => onEventClick(evt)}
                  style={{ borderLeftColor: evt.color }}
                  className={`group relative flex items-start justify-between p-4 rounded-xl border-l-4 border-t border-r border-b border-border/30 ${catInfo.bg} hover:border-primary/50 transition-all cursor-pointer shadow-sm`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${catInfo.text} bg-background/50 border border-border/20`}>
                        {catInfo.label}
                      </span>
                      {evt.startTime && (
                        <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                          <Clock size={12} /> {evt.startTime} - {evt.endTime || ''}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-foreground tracking-tight">
                      {evt.title}
                    </h4>

                    {evt.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(evt.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Etkinliği Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}