import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronLeft, RefreshCcw, ShieldCheck, Cpu, ExternalLink, Globe, FolderOpen, Github, Code } from 'lucide-react';

interface AppRunnerProps {
  appId: string;
  onBack: () => void;
}

export const AppRunner: React.FC<AppRunnerProps> = ({ appId, onBack }) => {
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appContent, setAppContent] = useState<string | null>(null);
  const [isFetchingLocal, setIsFetchingLocal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchAppData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'apps', appId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setApp(data);
          
          // Check if already saved in local storage (Offline Mode)
          const savedContent = localStorage.getItem(`app_content_${appId}`);
          if (savedContent) {
            setAppContent(savedContent);
            setIsSaved(true);
          } else {
            // Attempt to fetch if it's a direct file link for direct rendering
            if (data.type === 'drive' || data.type === 'github') {
              tryFetchContent(data.url);
            }
            
            // Check saved status (just the ID)
            const savedList = localStorage.getItem('saved_apps');
            if (savedList) {
              const parsed = JSON.parse(savedList);
              setIsSaved(parsed.includes(appId));
            }
          }
        } else {
          setError('Application not found in Aether Registry.');
        }
      } catch (err) {
        setError('Failed to establish connection to registry.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppData();
  }, [appId]);

  const tryFetchContent = async (url: string) => {
    let fetchUrl = url;
    
    // Convert sharing links to raw content links
    if (url.includes('drive.google.com/file/d/')) {
      const id = url.match(/\/d\/([^/]+)/)?.[1];
      if (id) fetchUrl = `https://docs.google.com/uc?id=${id}&export=download`;
    } else if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
      fetchUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    // Try to detect if it's likely meant to be a direct render
    const isPotentiallyRenderable = fetchUrl !== url || 
                                   url.endsWith('.html') || 
                                   url.endsWith('.txt') ||
                                   url.includes('raw.githubusercontent');

    if (isPotentiallyRenderable) {
      setIsFetchingLocal(true);
      try {
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const text = await res.text();
          // Heuristic: Check if it's HTML or just code to wrap in a pre-render
          if (text.trim().toLowerCase().startsWith('<') || text.toLowerCase().includes('<html>')) {
            setAppContent(text);
          }
        }
      } catch (e) {
        console.warn('Sandbox Handshake failed (CORS restriction). Reverting to cloud link.');
      } finally {
        setIsFetchingLocal(false);
      }
    }
  };

  const toggleSave = async () => {
    if (!isSaved) {
      setIsSaving(true);
      // Ensure we have content before saving if possible
      if (!appContent && app && (app.type === 'drive' || app.type === 'github')) {
        await tryFetchContent(app.url);
      }
      
      setTimeout(() => {
        const savedList = localStorage.getItem('saved_apps');
        let parsed = savedList ? JSON.parse(savedList) : [];
        if (!parsed.includes(appId)) parsed.push(appId);
        localStorage.setItem('saved_apps', JSON.stringify(parsed));
        
        if (appContent) {
          localStorage.setItem(`app_content_${appId}`, appContent);
        }
        
        setIsSaved(true);
        setIsSaving(false);
      }, 1200);
    } else {
      const savedList = localStorage.getItem('saved_apps');
      let parsed = savedList ? JSON.parse(savedList) : [];
      parsed = parsed.filter((id: string) => id !== appId);
      localStorage.setItem('saved_apps', JSON.stringify(parsed));
      localStorage.removeItem(`app_content_${appId}`);
      setIsSaved(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
      <RefreshCcw className="text-blue-500 animate-spin" size={32} />
      <div className="text-white/20 uppercase tracking-[0.4em] font-bold text-xs">Initializing Instance...</div>
    </div>
  );

  if (error || !app) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-rose-500 gap-4">
      <p className="font-bold">{error || 'Application initialization failed.'}</p>
      <button onClick={onBack} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white uppercase tracking-widest text-[10px] font-bold transition-all">
        Back to Gallery
      </button>
    </div>
  );

  const isDrive = app.type === 'drive';
  const isGithub = app.type === 'github';

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Dynamic Header */}
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Gallery</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
            {isDrive ? <FolderOpen size={16} className="text-amber-500" /> : 
             isGithub ? <Github size={16} className="text-purple-500" /> : 
             <Globe size={16} className="text-blue-500" />}
            <h2 className="text-sm font-bold tracking-tight">{app.name}</h2>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/20 px-2 py-0.5 border border-white/10 rounded-md">
              {appContent ? 'Running Local' : isDrive ? 'File System' : isGithub ? 'Repository' : 'Cloud Host'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
              isSaving
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 animate-pulse cursor-wait'
                : isSaved 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
            }`}
          >
            {isSaving ? 'Downloading...' : isSaved ? 'Delete from Offline' : 'Save for Offline'}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <ShieldCheck size={12} className={`transition-colors ${appContent ? 'text-emerald-500' : 'text-blue-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${appContent ? 'text-emerald-500' : 'text-blue-500/80'}`}>
              {appContent ? 'Encapsulated' : 'Connective'}
            </span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white" title="Reload Shell">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Sandbox / Connection Area */}
      <div className="flex-1 bg-white relative flex flex-col items-center justify-center overflow-hidden">
        {appContent ? (
          <iframe 
            title={app.name}
            srcDoc={appContent}
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
            className="w-full h-full border-none"
          />
        ) : (isDrive || isGithub) ? (
          <div className="text-center p-8 bg-black w-full h-full flex flex-col items-center justify-center gap-6">
            <div className={`w-24 h-24 border rounded-full flex items-center justify-center animate-pulse ${isDrive ? 'bg-amber-500/10 border-amber-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
              {isDrive ? <FolderOpen size={48} className="text-amber-500" /> : <Github size={48} className="text-purple-500" />}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">{isDrive ? 'Google Drive App' : 'GitHub Resource'}</h3>
              <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed mb-4">
                {isFetchingLocal 
                  ? "Attempting to establish direct content stream..." 
                  : isDrive 
                    ? "This application's assets are hosted on Google Drive. You can download them to run locally or access them through the cloud link." 
                    : "This application's source code is hosted on GitHub. Save it to your local environment to work offline."}
              </p>
              {isSaved && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-[0.2em] rounded-md border border-emerald-500/20 mb-6">
                  <ShieldCheck size={10} /> Saved for Offline Access
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <a 
                href={app.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`px-8 py-4 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-3 shadow-xl ${isDrive ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'}`}
              >
                Open {isDrive ? 'Drive Folder' : 'GitHub Repo'} <ExternalLink size={14} />
              </a>
              
              {(isDrive || isGithub) && !appContent && (
                <button 
                  onClick={() => tryFetchContent(app.url)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-3 border border-white/10"
                >
                  <RefreshCcw size={14} className={isFetchingLocal ? 'animate-spin' : ''} />
                  {isFetchingLocal ? 'Detecting Content...' : 'Try Direct Render'}
                </button>
              )}
            </div>

            {app.buildInstructions && (
              <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-3xl max-w-md w-full text-left">
                <div className="flex items-center gap-2 mb-3 text-white/40 uppercase tracking-widest text-[9px] font-bold">
                  <Code size={12} className="text-blue-500" /> Run Instructions
                </div>
                <code className="text-blue-300/80 text-[11px] block bg-black/40 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                  {app.buildInstructions}
                </code>
              </div>
            )}
          </div>
        ) : (
          <iframe 
            title={app.name}
            src={app.url}
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
            className="w-full h-full border-none"
          />
        )}
      </div>
    </div>
  );
};
