"use client";
import React from 'react';
import { DAYS_TR, getMonthGrid, CATEGORY_COLORS } from './calendarUtils';
import { CalendarEvent } from '@/lib/store/types';
import { Clock } from 'lucide-react';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (dateStr: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarMonthView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: CalendarMonthViewProps) {
  const days = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div className="flex flex-col flex-1 bg-card/40 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border/40 bg-background/40">
        {DAYS_TR.map((day, idx) => (
          <div
            key={day}
            className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${
              idx >= 5 ? 'text-muted-foreground/60' : 'text-muted-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-[500px]">
        {days.map((dayCell, idx) => {
          const dayEvents = events.filter((e) => e.date === dayCell.dateStr);

          return (
            <div
              key={idx}
              onClick={() => onDayClick(dayCell.dateStr)}
              className={`group relative flex flex-col border-b border-r border-border/20 p-1.5 transition-colors cursor-pointer hover:bg-white/[0.02] ${
                !dayCell.isCurrentMonth ? 'bg-background/20 text-muted-foreground/30' : ''
              } ${dayCell.isToday ? 'bg-primary/5' : ''}`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-lg transition-colors ${
                    dayCell.isToday
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : dayCell.isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground/40'
                  }`}
                >
                  {dayCell.dayNumber}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-border/40 text-muted-foreground">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event Pills */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-24 custom-scrollbar">
                {dayEvents.slice(0, 3).map((evt) => {
                  const catInfo = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.study;
                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(evt);
                      }}
                      style={{ borderLeftColor: evt.color }}
                      className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] font-medium border-l-2 ${catInfo.bg} ${catInfo.text} hover:opacity-90 transition-opacity truncate`}
                    >
                      {evt.startTime && (
                        <span className="text-[10px] opacity-75 font-mono">{evt.startTime}</span>
                      )}
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] font-medium text-muted-foreground text-center pt-0.5">
                    +{dayEvents.length - 3} daha
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}