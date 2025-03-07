// 整個應用中共想LIFF狀態
'use client';
import { createContext, useContext } from 'react';
import { useLiff } from '@/hooks/useLiff';

const LiffContext = createContext(null);

export function LiffProvider({ children }) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  const { liff, error } = useLiff(liffId);
  
  return (
    <LiffContext.Provider value={{ liff, error }}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiffContext() {
  return useContext(LiffContext);
}