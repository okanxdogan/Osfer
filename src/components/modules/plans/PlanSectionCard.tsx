"use client";
import React, { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { AnimatedCheckbox } from '@/components/shared/AnimatedCheckbox';
import { PlanScope } from '@/lib/store/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Calendar } from 'lucide-react';

function getTaskDates(createdAt: number, scope: PlanScope) {
  const start = new Date(createdAt);
  const end = new Date(createdAt);
  
  if (scope === 'daily') {
    end.setHours(23, 59, 59, 999);
  } else if (scope === 'weekly') {
    const day = end.getDay(); 
    const distanceToSunday = day === 0 ? 0 : 7 - day;
    end.setDate(end.getDate() + distanceToSunday);
    end.setHours(23, 59, 59, 999);
  } else if (scope === 'monthly') {
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  }
  
  const formatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' });
  return {
    startStr: formatter.format(start),
    endStr: formatter.format(end),
  };
}

export function PlanSectionCard({ title, scope, delay }: { title: string, scope: PlanScope, delay: number }) {
  const { tasks, addTask, toggleTask, deleteTask } = useGlobalStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const scopeTasks = tasks.filter(t => t.scope === scope);
  const completedCount = scopeTasks.filter(t => t.status === 'completed').length;
  const progress = scopeTasks.length > 0 ? (completedCount / scopeTasks.length) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsAdding(false);
      setNewTaskDesc('');
      return;
    }
    addTask({ title: newTaskTitle.trim(), description: newTaskDesc.trim() || undefined, scope });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAdding(false);
  };

  return (
    <GlassCard delay={delay} className="h-[520px]">
      <div className="p-6 h-full flex flex-col w-full">
        {/* Header — just the title */}
        <div className="mb-5 shrink-0">
          <motion.h2 whileHover={{ scale: 1.05 }} className="text-lg font-semibold tracking-tight text-foreground origin-left cursor-default">{title}</motion.h2>
          {scopeTasks.length > 0 && (
            <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
              />
            </div>
          )}
        </div>

        {/* Task list container */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {isAdding && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleAdd}
                  className="mb-2 shrink-0 bg-muted/10 p-3 rounded-xl border border-primary/20 flex flex-col gap-2 shadow-sm"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Task title..."
                    className="w-full bg-transparent border-none outline-none text-foreground text-sm font-medium placeholder:text-muted-foreground/50 focus:ring-0 px-1"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Add a description (optional)..."
                    className="w-full bg-transparent border-none outline-none text-muted-foreground text-[13px] resize-none h-16 placeholder:text-muted-foreground/40 custom-scrollbar focus:ring-0 px-1"
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAdd(e as any);
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <button type="button" onClick={() => { setIsAdding(false); setNewTaskTitle(''); setNewTaskDesc(''); }} className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/30 transition-colors">Cancel</button>
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors">Add</button>
                  </div>
                </motion.form>
              )}

              {scopeTasks.map(task => {
                const { startStr, endStr } = getTaskDates(task.createdAt, scope);
                return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: task.status === 'completed' ? 0.45 : 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  whileHover="hover"
                  transition={{ duration: 0.2 }}
                  className={`group flex flex-col p-3.5 rounded-xl border transition-all shrink-0 ${task.status === 'completed' ? 'bg-transparent border-transparent' : 'bg-muted/10 border-border/20 hover:bg-muted/30 shadow-sm'}`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-3.5 flex-1 overflow-hidden">
                      <div className="pt-0.5 shrink-0">
                        <AnimatedCheckbox checked={task.status === 'completed'} onChange={() => toggleTask(task.id)} />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <motion.span 
                          variants={{
                            hover: { x: 5 }
                          }}
                          className={`text-[14px] truncate font-medium transition-all origin-left cursor-default ${task.status === 'completed' ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}
                        >
                          {task.title}
                        </motion.span>
                        {task.description && (
                          <motion.p
                            variants={{ hover: { x: 5 } }}
                            className={`text-[13px] mt-1.5 transition-all origin-left whitespace-pre-wrap leading-relaxed ${task.status === 'completed' ? 'text-muted-foreground/40' : 'text-muted-foreground/80'}`}
                          >
                            {task.description}
                          </motion.p>
                        )}
                        <motion.div
                          variants={{ hover: { x: 5 } }}
                          className={`flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold transition-all origin-left ${task.status === 'completed' ? 'text-muted-foreground/30' : 'text-primary/70'}`}
                        >
                          <Calendar size={12} strokeWidth={2.5} />
                          <span>{startStr} - {endStr}</span>
                        </motion.div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all w-8 h-8 flex items-center justify-center shrink-0 rounded-lg hover:bg-destructive/10 -mt-1 -mr-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}

              {/* Empty state — this IS the add button */}
              {scopeTasks.length === 0 && !isAdding && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsAdding(true)}
                  className="flex-1 min-h-[160px] flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-muted/10 group-hover:bg-primary/10 border border-border/30 group-hover:border-primary/30 rounded-full flex items-center justify-center mb-4 transition-all">
                    <Plus size={24} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                  <motion.p whileHover={{ scale: 1.05 }} className="text-sm font-medium text-muted-foreground/50 group-hover:text-foreground/70 transition-colors">
                    Add your first task
                  </motion.p>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom add button — only shows when tasks exist */}
        <div className="mt-5 pt-4 border-t border-border/10 shrink-0">
          {!isAdding && scopeTasks.length > 0 && (
            <motion.button
              whileHover="hover"
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-muted-foreground hover:text-foreground border border-white/5 shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} /> 
              <motion.span variants={{ hover: { scale: 1.1 } }}>
                Add task
              </motion.span>
            </motion.button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
