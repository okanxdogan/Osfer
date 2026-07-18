"use client";
import React from 'react';
import { motion } from 'framer-motion';

export function CircularTimer({ progress, timeString, isRunning }: { progress: number, timeString: string, isRunning: boolean }) {
  const circleRadius = 140;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="340" height="340" viewBox="0 0 340 340" className="-rotate-90">
        <circle 
          cx="170" cy="170" r={circleRadius} 
          fill="none" 
          strokeWidth="12" 
          className="stroke-muted/10" 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
            <motion.span 
              whileHover={{ scale: 1.05 }} 
              className="text-7xl font-bold tracking-tighter text-foreground tabular-nums drop-shadow-lg cursor-default block"
            >
              {timeString}
            </motion.span>
          </motion.div>
      </div>
    </div>
  );
}
