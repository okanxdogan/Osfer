export const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const CATEGORY_COLORS = {
  study: { label: 'Çalışma / Ders', color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  task: { label: 'Görev / Proje', color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  exam: { label: 'Sınav / Test', color: '#EF4444', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
  personal: { label: 'Kişisel / Etkinlik', color: '#8B5CF6', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
};

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export interface DayCell {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  dayNumber: number;
  isToday: boolean;
}

export function getMonthGrid(year: number, month: number): DayCell[] {
  const todayStr = formatDateISO(new Date());
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Get Monday as 0 (JavaScript Date getDay(): Sunday=0, Monday=1, ..., Saturday=6)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

  const days: DayCell[] = [];

  // Previous month padding days
  for (let i = startDayOfWeek; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    const dateStr = formatDateISO(d);
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: false,
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    const dateStr = formatDateISO(d);
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: true,
      dayNumber: i,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding days to complete 35 or 42 grid cells
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = formatDateISO(d);
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: false,
      dayNumber: i,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}