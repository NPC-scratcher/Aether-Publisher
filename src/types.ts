import { ReactNode } from 'react';

export type AppId = 'files' | 'settings' | 'notepad' | 'store';

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: any;
}

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: ReactNode;
  component: (data?: any) => ReactNode;
  isSystem?: boolean;
}
