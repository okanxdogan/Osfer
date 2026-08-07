"use client";
import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { CalendarHeader, CalendarViewMode } from '@/components/modules/calendar/CalendarHeader';
import { CalendarMonthView } from '@/components/modules/calendar/CalendarMonthView';
import { CalendarWeekView } from '@/components/modules/calendar/CalendarWeekView';
import { CalendarDayView } from '@/components/modules/calendar/CalendarDayView';
import { EventModal } from '@/components/modules/calendar/EventModal';
import { CalendarEvent } from '@/lib/store/types';
import { formatDateISO } from '@/components/modules/calendar/calendarUtils';

export default function CalendarPage() {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useGlobalStore();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDateISO(new Date()));
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDateStr(event.date);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, eventData);
    } else {
      addCalendarEvent(eventData);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <PageHeader
        title="Takvim & Program"
        description="Aylık, haftalık ve günlük ders/çalışma planlarınızı organize edin ve takip edin."
      />

      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewEvent={() => {
          setEditingEvent(null);
          setSelectedDateStr(formatDateISO(currentDate));
          setIsModalOpen(true);
        }}
      />

      {viewMode === 'month' && (
        <CalendarMonthView
          currentDate={currentDate}
          events={calendarEvents}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
        />
      )}

      {viewMode === 'week' && (
        <CalendarWeekView
          currentDate={currentDate}
          events={calendarEvents}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
        />
      )}

      {viewMode === 'day' && (
        <CalendarDayView
          currentDate={currentDate}
          events={calendarEvents}
          onNewEvent={() => {
            setEditingEvent(null);
            setSelectedDateStr(formatDateISO(currentDate));
            setIsModalOpen(true);
          }}
          onEventClick={handleEventClick}
          onDeleteEvent={deleteCalendarEvent}
        />
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={deleteCalendarEvent}
        initialDate={selectedDateStr}
        editingEvent={editingEvent}
      />
    </div>
  );
}