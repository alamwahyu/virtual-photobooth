"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(from = 3) {
  const [value, setValue] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = useCallback(() => {
    clear();
    setValue(from);
    return new Promise<void>((resolve) => {
      let current = from;
      timerRef.current = window.setInterval(() => {
        current -= 1;
        if (current <= 0) {
          clear();
          setValue(null);
          resolve();
        } else {
          setValue(current);
        }
      }, 900);
    });
  }, [clear, from]);

  useEffect(() => clear, [clear]);

  return { value, start, clear };
}
