import { useState, useEffect } from 'react';

export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
}

export function useResponsiveColumnCount() {
  const [columnCount, setColumnCount] = useState(1);
  useEffect(() => {
    function updateColumns() {
      if (window.innerWidth >= 1280) {
        setColumnCount(3);
      } else if (window.innerWidth >= 1024) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    }
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  return columnCount;
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
