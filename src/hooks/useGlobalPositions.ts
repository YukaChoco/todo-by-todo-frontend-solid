import { createStore } from "solid-js/store";

// グローバルな位置管理ストア
const [globalPositions, setGlobalPositions] = createStore<
  Record<number, { top: number; left: number }>
>({});

export function useGlobalPositions() {
  const getPosition = (itemId: number) => globalPositions[itemId];
  
  const setPosition = (itemId: number, position: { top: number; left: number }) => {
    setGlobalPositions(itemId, position);
  };

  const hasPosition = (itemId: number) => itemId in globalPositions;

  const removePosition = (itemId: number) => {
    setGlobalPositions(itemId, undefined as any);
  };

  return {
    getPosition,
    setPosition,
    hasPosition,
    removePosition,
  };
} 