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

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'apps', appId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApp(docSnap.data());
        } else {
          setError('Application not found.');
        }
      } catch (err) {
        setError('Failed to load the application.');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [appId]);

  if (loading) return <div className="h-screen flex items-center justify-center text-white/20 uppercase tracking-[0.4em] font-bold">Initializing Instance...</div>;
  if (error) return <div className="h-screen flex flex-col items-center justify-center text-rose-500 gap-4">
    <p>{error}</p>
    <button onClick={onBack} className="text-white/60 hover:text-white uppercase tracking-widest text-[10px] font-bold">Back to Gallery</button>
  </div>;

  const isDrive = app.type === 'drive';
  const isGithub = app.type === 'github';

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Dynamic Header */}
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
            {isDrive ? <FolderOpen size={16} className="text-amber-500" /> : 
             isGithub ? <Github size={16} className="text-purple-500" /> : 
             <Globe size={16} className="text-blue-500" />}
            <h2 className="text-sm font-bold tracking-tight">{app.name}</h2>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/20 px-2 py-0.5 border border-white/10 rounded-md">
              {isDrive ? 'File System' : isGithub ? 'Repository' : 'Cloud Host'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <ShieldCheck size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">Connective</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white" title="Reload Shell">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Sandbox / Connection Area */}
      <div className="flex-1 bg-white relative flex flex-col items-center justify-center overflow-hidden">
        {isDrive || isGithub ? (
          <div className="text-center p-8 bg-black w-full h-full flex flex-col items-center justify-center gap-6">
            <div className={`w-24 h-24 border rounded-full flex items-center justify-center animate-pulse ${isDrive ? 'bg-amber-500/10 border-amber-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
              {isDrive ? <FolderOpen size={48} className="text-amber-500" /> : <Github size={48} className="text-purple-500" />}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{isDrive ? 'Google Drive Repository' : 'GitHub Repository'}</h3>
              <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                {isDrive ? "This application's assets are hosted on Google Drive. Click below to open the folder and access the content." : "This application's source code is hosted on GitHub. Click below to explore the repository."}
              </p>
            </div>
            <a 
              href={app.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`px-8 py-4 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-3 shadow-xl ${isDrive ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'}`}
            >
              Open {isDrive ? 'Drive Folder' : 'GitHub Repo'} <ExternalLink size={14} />
            </a>

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
