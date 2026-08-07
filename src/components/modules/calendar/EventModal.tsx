"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Tag, AlignLeft, Trash2 } from 'lucide-react';
import { CalendarEvent } from '@/lib/store/types';
import { CATEGORY_COLORS, formatDateISO } from './calendarUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  initialDate?: string;
  editingEvent?: CalendarEvent | null;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  editingEvent,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || formatDateISO(new Date()));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<'study' | 'task' | 'exam' | 'personal'>('study');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime || '10:00');
      setEndTime(editingEvent.endTime || '11:00');
      setCategory(editingEvent.category);
      setDescription(editingEvent.description || '');
    } else {
      setTitle('');
      setDate(initialDate || formatDateISO(new Date()));
      setStartTime('10:00');
      setEndTime('11:00');
      setCategory('study');
      setDescription('');
    }
  }, [editingEvent, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      date,
      startTime,
      endTime,
      category,
      color: CATEGORY_COLORS[category].color,
      description: description.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card border border-border/40 shadow-2xl p-6"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik / Program'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Başlık
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yazılım Mimarisi Çalışması"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tarih
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Başlangıç
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Bitiş
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Kategori
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map((cat) => {
                  const info = CATEGORY_COLORS[cat];
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        isSelected
                          ? `${info.bg} ${info.border} ${info.text} ring-2 ring-primary/40`
                          : 'bg-background/40 border-border/30 text-muted-foreground hover:bg-white/5'
                      }`}
                    >
                      {info.label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Açıklama / Notlar
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Etkinlik hakkında detaylar..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              {editingEvent && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(editingEvent.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={14} /> Sil
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border/40 text-xs font-semibold text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}