import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Whenever initialSeconds change, auto-reset if not running
    if (!isRunning) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && endTimeRef.current) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setIsRunning(false);
        }
      }, 100); // 100ms polling for smooth UI updates and precision
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    if (!isRunning) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    }
  }, [timeLeft, isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  const reset = useCallback((newInitialSeconds?: number) => {
    setIsRunning(false);
    endTimeRef.current = null;
    setTimeLeft(newInitialSeconds !== undefined ? newInitialSeconds : initialSeconds);
  }, [initialSeconds]);

  return { timeLeft, isRunning, start, pause, reset, setTimeLeft };
}
