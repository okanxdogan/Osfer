"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';

export function InlineEditor({ value, onSave, className, type = 'text' }: { value: string | number, onSave: (val: string) => void, className?: string, type?: 'text'|'number' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue.trim() !== value.toString()) onSave(currentValue);
    else setCurrentValue(value.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(value.toString());
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={currentValue}
        onChange={e => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-primary/10 border-none outline-none text-primary px-3 py-1 rounded-md max-w-[150px] focus:ring-2 ring-primary/50 shadow-inner ${className}`}
      />
    );
  }

  return (
    <motion.span 
      onClick={() => setIsEditing(true)}
      className={`group relative cursor-pointer hover:text-primary transition-colors inline-flex items-center gap-3 ${className}`}
      variants={{
        hover: { scale: 1.02 }
      }}
      whileHover="hover"
      initial="initial"
    >
      <span className="relative">
        {value}
      </span>
      <motion.span 
        variants={{
          hover: { opacity: 1, x: 0, scale: 1 },
          initial: { opacity: 0, x: -5, scale: 0.8 }
        }}
        className="text-primary transition-all flex items-center justify-center shrink-0"
      >
        <Pencil style={{ width: '0.6em', height: '0.6em' }} strokeWidth={3} />
      </motion.span>
    </motion.span>
  );
}
