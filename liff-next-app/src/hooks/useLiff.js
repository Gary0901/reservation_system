'use client';
import { useState, useEffect } from 'react';
import liff from '@line/liff';

export function useLiff(liffId) {
  const [liffObject, setLiffObject] = useState(null);
  const [liffError, setLiffError] = useState(null);

  // 初始化LIFF
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId });
        console.log('LIFF初始化成功！');
        setLiffObject(liff);
      } catch (error) {
        console.error('LIFF初始化失敗：', error);
        setLiffError(error);
      }
    };

    initLiff();
  }, [liffId]);

  return { liff: liffObject, error: liffError };
}