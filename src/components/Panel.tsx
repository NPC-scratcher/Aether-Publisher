import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Grid,
  ChevronLeft,
  Pin,
  PinOff
} from 'lucide-react';
import { AppDefinition } from '../types';

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppDefinition[];
  pinnedAppIds: string[];
  onTogglePin: (appId: string) => void;
  onOpenApp: (appId: AppDefinition['id'], title: string) => void;
}

export const Panel: React.FC<PanelProps> = ({ 
  isOpen, 
  onClose, 
  apps, 
  pinnedAppIds, 
  onTogglePin,
  onOpenApp
}) => {
  const [view, setView] = useState<'main' | 'all-apps'>('main');

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[9000]" 
        onClick={onClose} 
      />
      
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-14 left-4 w-72 h-96 z-[9001] glass bg-black/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10 backdrop-blur-3xl"
      >
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'main' ? (
              <motion.div 
                key="main"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="h-full flex flex-col p-6 items-center justify-center gap-6"
              >
                <button 
                  onClick={() => setView('all-apps')}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border border-white/5 w-full"
                >
                  <Grid size={24} className="text-white/40 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 group-hover:text-white">All Apps</span>
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="all-apps"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="h-full flex flex-col pt-4"
              >
                <div className="px-4 pb-2 border-b border-white/5 flex items-center gap-2">
                  <button onClick={() => setView('main')} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Applications</span>
                </div>
                
                <div className="flex-1 overflow-y-auto px-2 py-2">
                  {[...apps].sort((a, b) => a.name.localeCompare(b.name)).map(app => {
                    const isPinned = pinnedAppIds.includes(app.id);
                    return (
                      <div key={app.id} className="flex items-center justify-between group px-1">
                        <button 
                          onClick={() => { onOpenApp(app.id, app.name); onClose(); }}
                          className="flex-1 flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <div className="text-white/60">{app.icon}</div>
                          <span className="text-[11px] font-medium text-white/60 group-hover:text-white transition-colors">{app.name}</span>
                        </button>
                        <button 
                          onClick={() => onTogglePin(app.id)}
                          className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isPinned ? 'text-blue-400' : 'text-white/20 hover:text-white/60'}`}
                        >
                          {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action corner */}
        <div className="p-4 border-t border-white/5 flex justify-end">
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group border border-white/5 hover:border-white/10">
            <Settings size={18} className="text-white/60 group-hover:text-white group-hover:rotate-45 transition-all duration-500" />
          </button>
        </div>
      </motion.div>
    </>
  );
};
