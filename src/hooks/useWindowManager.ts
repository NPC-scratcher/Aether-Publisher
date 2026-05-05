import { useState, useCallback, useEffect } from 'react';
import { WindowInstance, AppId } from '../types';

const STORAGE_KEY = 'aether_windows_state';

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowInstance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
  }, [windows]);

  const openApp = useCallback((appId: AppId, title: string, data?: any) => {
    setWindows((prev) => {
      const existing = prev.find(w => w.appId === appId);
      if (existing) {
        setActiveWindowId(existing.id);
        return prev.map(w => w.id === existing.id ? { ...w, isMinimized: false, data: data || w.data } : w);
      }

      const id = `${appId}-${Date.now()}`;
      const newWindow: WindowInstance = {
        id,
        appId,
        title,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: prev.length + 10,
        data
      };
      
      setActiveWindowId(id);
      return [...prev, newWindow];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  }, [activeWindowId]);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows((prev) => {
      const maxZ = Math.max(0, ...prev.map(w => w.zIndex));
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w);
    });
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows((prev) => {
      return prev.map(w => {
        if (w.id === id) {
          const newState = !w.isMinimized;
          if (newState && activeWindowId === id) setActiveWindowId(null);
          if (!newState) setActiveWindowId(id);
          return { ...w, isMinimized: newState };
        }
        return w;
      });
    });
  }, [activeWindowId]);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  return {
    windows,
    activeWindowId,
    openApp,
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
  };
}
