import React, { useState } from 'react';
import { AppGallery } from './components/AppGallery';
import { AppPublisher } from './components/AppPublisher';
import { AppRunner } from './components/AppRunner';
import { Layout, Plus, Rocket, User, LogIn, ChevronLeft } from 'lucide-react';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

type View = 'gallery' | 'publish' | 'runner';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [currentView, setCurrentView] = useState<View>('gallery');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const openApp = (id: string) => {
    setSelectedAppId(id);
    setCurrentView('runner');
  };

  const closeApp = () => {
    setSelectedAppId(null);
    setCurrentView('gallery');
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <Rocket className="text-blue-500 animate-pulse" size={48} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Navigation */}
      <nav className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('gallery')}
        >
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Rocket size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Aether Publisher</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-3 border-white/10 pl-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold truncate max-w-[100px]">{user.displayName}</span>
                <button onClick={() => signOut(auth)} className="text-[9px] text-white/20 hover:text-rose-400 transition-colors uppercase tracking-widest font-bold">Sign Out</button>
              </div>
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-white/10" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-blue-50 transition-all shrink-0"
            >
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {currentView === 'gallery' && <AppGallery onOpenApp={openApp} onPublish={() => setCurrentView('publish')} />}
        {currentView === 'publish' && <AppPublisher onComplete={() => setCurrentView('gallery')} />}
        {currentView === 'runner' && selectedAppId && <AppRunner appId={selectedAppId} onBack={closeApp} />}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 bg-black/20 text-center">
        <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">Powered by Aether & Firebase • 2026</p>
      </footer>
    </div>
  );
}
