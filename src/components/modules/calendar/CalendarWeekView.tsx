"use client";
import React from 'react';
import { DAYS_TR, formatDateISO, isSameDay, CATEGORY_COLORS } from './calendarUtils';
import { CalendarEvent } from '@/lib/store/types';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (dateStr: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarWeekView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: CalendarWeekViewProps) {
  // Get start of week (Monday)
  const curr = new Date(currentDate);
  const day = curr.getDay();
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(curr.setDate(diff));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      dateStr: formatDateISO(d),
      dayName: DAYS_TR[i],
      dayNumber: d.getDate(),
      isToday: isSameDay(d, new Date()),
    };
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00

  return (
    <div className="flex flex-col flex-1 bg-card/40 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Week Day Headers */}
      <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border/40 bg-background/40">
        <div className="py-3 text-center text-xs font-semibold text-muted-foreground border-r border-border/20">
          Saat
        </div>
        {weekDays.map((wd) => (
          <div
            key={wd.dateStr}
            onClick={() => onDayClick(wd.dateStr)}
            className={`py-2 text-center cursor-pointer hover:bg-white/[0.02] border-r border-border/20 ${
              wd.isToday ? 'bg-primary/5' : ''
            }`}
          >
            <div className="text-[11px] font-semibold text-muted-foreground uppercase">{wd.dayName}</div>
            <div
              className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-lg mt-0.5 ${
                wd.isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}
            >
              {wd.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Schedule Grid */}
      <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
        {hours.map((hour) => {
          const hourStr = `${String(hour).padStart(2, '0')}:00`;

          return (
            <div
              key={hour}
              className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border/20 min-h-[56px]"
            >
              <div className="p-2 text-center text-[11px] font-mono text-muted-foreground border-r border-border/20 bg-background/20 select-none">
                {hourStr}
              </div>

              {weekDays.map((wd) => {
                const dayEvents = events.filter((e) => {
                  if (e.date !== wd.dateStr) return false;
                  if (!e.startTime) return true;
                  const eventHour = parseInt(e.startTime.split(':')[0], 10);
                  return eventHour === hour;
                });

                return (
                  <div
                    key={wd.dateStr}
                    onClick={() => onDayClick(wd.dateStr)}
                    className="p-1 border-r border-border/20 hover:bg-white/[0.02] transition-colors relative cursor-pointer"
                  >
                    {dayEvents.map((evt) => {
                      const catInfo = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.study;
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(evt);
                          }}
                          style={{ borderLeftColor: evt.color }}
                          className={`p-1.5 rounded-lg text-xs font-semibold border-l-3 ${catInfo.bg} ${catInfo.text} hover:opacity-90 shadow-sm cursor-pointer truncate mb-1`}
                        >
                          <div className="truncate">{evt.title}</div>
                          {evt.startTime && (
                            <div className="text-[10px] opacity-75 font-mono">
                              {evt.startTime} - {evt.endTime || ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}