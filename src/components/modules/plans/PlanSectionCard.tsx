"use client";
import React, { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { AnimatedCheckbox } from '@/components/shared/AnimatedCheckbox';
import { PlanScope } from '@/lib/store/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

export function PlanSectionCard({ title, scope, delay }: { title: string, scope: PlanScope, delay: number }) {
  const { tasks, addTask, toggleTask, deleteTask } = useGlobalStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const scopeTasks = tasks.filter(t => t.scope === scope).sort((a, b) => b.createdAt - a.createdAt);
  const completedCount = scopeTasks.filter(t => t.status === 'completed').length;
  const progress = scopeTasks.length > 0 ? (completedCount / scopeTasks.length) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsAdding(false);
      return;
    }
    addTask({ title: newTaskTitle, scope });
    setNewTaskTitle('');
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
                  className="mb-1 shrink-0"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Add a task...`}
                    className="w-full bg-muted/20 border border-primary/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-foreground text-sm font-medium shadow-sm transition-all"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onBlur={handleAdd}
                  />
                </motion.form>
              )}

              {scopeTasks.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: task.status === 'completed' ? 0.45 : 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  whileHover="hover"
                  transition={{ duration: 0.2 }}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all shrink-0 ${task.status === 'completed' ? 'bg-transparent border-transparent' : 'bg-muted/10 border-border/20 hover:bg-muted/30 shadow-sm'}`}
                >
                  <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
                    <AnimatedCheckbox checked={task.status === 'completed'} onChange={() => toggleTask(task.id)} />
                    <motion.span 
                      variants={{
                        hover: { scale: 1.02, x: 5 }
                      }}
                      className={`text-[14px] truncate font-medium transition-all origin-left cursor-default ${task.status === 'completed' ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}
                    >
                      {task.title}
                    </motion.span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all w-8 h-8 flex items-center justify-center shrink-0 rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}

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
