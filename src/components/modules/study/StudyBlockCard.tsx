"use client";
import React, { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { StudyBlock } from '@/lib/store/types';
import { AnimatedCheckbox } from '@/components/shared/AnimatedCheckbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MoreHorizontal, Pencil } from 'lucide-react';

export function StudyBlockCard({ block, delay }: { block: StudyBlock, delay: number }) {
  const { addStudyTask, toggleStudyTask, deleteStudyTask, deleteStudyBlock, renameStudyBlock } = useGlobalStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(block.title);

  const completedCount = block.tasks.filter(t => t.status === 'completed').length;
  const progress = block.tasks.length > 0 ? (completedCount / block.tasks.length) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) { setIsAdding(false); return; }
    addStudyTask(block.id, newTaskTitle);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== block.title) {
      renameStudyBlock(block.id, renameValue.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  return (
    <GlassCard delay={delay} className="p-6 flex flex-col justify-between border-t-[6px] min-h-[280px]" style={{ borderTopColor: block.color }}>
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="text-xl font-bold tracking-tight bg-transparent border-b-2 border-primary outline-none text-foreground flex-1 pb-1"
            />
          ) : (
            <motion.h3 whileHover={{ scale: 1.05 }} className="text-xl font-bold tracking-tight text-foreground flex-1 origin-left cursor-default">{block.title}</motion.h3>
          )}

          {/* Block menu */}
          <div className="relative shrink-0">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 z-20 bg-card border border-border/60 rounded-xl shadow-xl py-1.5 min-w-[160px]">
                <button onClick={() => { setIsRenaming(true); setShowMenu(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/40 transition-colors text-left">
                  <Pencil size={14} /> Rename
                </button>
                <button onClick={() => { deleteStudyBlock(block.id); setShowMenu(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-destructive/10 text-destructive transition-colors text-left">
                  <Trash2 size={14} /> Delete Block
                </button>
              </div>
            )}
          </div>
        </div>

        {block.tasks.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: block.color }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
              />
            </div>
            <motion.span whileHover={{ scale: 1.1 }} className="text-xs font-semibold text-muted-foreground/60 tabular-nums cursor-default">{completedCount}/{block.tasks.length}</motion.span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {block.tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: task.status === 'completed' ? 0.4 : 1, x: 0 }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              whileHover="hover"
              className="flex items-center gap-3 py-1.5 group"
            >
              <AnimatedCheckbox checked={task.status === 'completed'} onChange={() => toggleStudyTask(block.id, task.id)} />
              <motion.span 
                variants={{
                  hover: { scale: 1.02, x: 5 }
                }}
                className={`text-[14px] font-medium transition-all flex-1 truncate origin-left cursor-default ${task.status === 'completed' ? 'line-through text-muted-foreground/50' : 'text-foreground'}`}
              >
                {task.title}
              </motion.span>
              <button
                onClick={() => deleteStudyTask(block.id, task.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}

          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, height: 0 }} 
              onSubmit={handleAdd} 
              className="mt-1"
            >
              <input
                autoFocus type="text" placeholder="Task title..."
                className="w-full bg-muted/20 border border-primary/15 rounded-lg px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-1 focus:ring-primary/30"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onBlur={handleAdd}
              />
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover="hover"
        onClick={() => setIsAdding(true)} 
        className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg hover:bg-muted/20 transition-colors text-sm font-medium text-muted-foreground/60 hover:text-foreground border border-transparent hover:border-border/30"
      >
        <Plus size={16} /> 
        <motion.span variants={{ hover: { scale: 1.1 } }}>
          Add Task
        </motion.span>
      </motion.button>
    </GlassCard>
  );
}
