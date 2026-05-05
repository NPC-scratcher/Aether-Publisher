import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Rocket, Send, ChevronLeft, Globe, FolderOpen, Image as ImageIcon, Info, Link as LinkIcon, Github, Code } from 'lucide-react';

interface AppPublisherProps {
  onComplete: () => void;
}

export const AppPublisher: React.FC<AppPublisherProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'url' | 'drive' | 'github'>('url');
  const [logoUrl, setLogoUrl] = useState('');
  const [buildInstructions, setBuildInstructions] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsPublishing(true);
    setError(null);

    try {
      await addDoc(collection(db, 'apps'), {
        name,
        description: description || null,
        url,
        type,
        logoUrl: logoUrl || null,
        buildInstructions: buildInstructions || null,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
      });
      onComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to publish application.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onComplete}
          className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter">Publish Application</h2>
          <p className="text-white/30 text-sm">Deploy your project to the Aether network.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Source Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            type="button"
            onClick={() => setType('url')}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${type === 'url' ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-white/2 border-white/5 text-white/30 hover:border-white/10'}`}
          >
            <Globe size={32} />
            <div className="text-center">
              <span className="block text-sm font-bold">External Website</span>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Direct Link</span>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={() => setType('drive')}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${type === 'drive' ? 'bg-amber-600/10 border-amber-600 text-white' : 'bg-white/2 border-white/5 text-white/30 hover:border-white/10'}`}
          >
            <FolderOpen size={32} />
            <div className="text-center">
              <span className="block text-sm font-bold">Google Drive</span>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Folder Link</span>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => setType('github')}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${type === 'github' ? 'bg-purple-600/10 border-purple-600 text-white' : 'bg-white/2 border-white/5 text-white/30 hover:border-white/10'}`}
          >
            <Github size={32} />
            <div className="text-center">
              <span className="block text-sm font-bold">GitHub Repo</span>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Repository URL</span>
            </div>
          </button>
        </div>

        <div className="bg-white/2 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-1">Title (Required)</label>
              <div className="relative">
                <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="My Web App"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-1 flex justify-between">
                <span>Icon URL (Optional)</span>
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://icon.png"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                />
              </div>
              <p className="text-[9px] text-white/20 px-1">
                Tip: For Google Drive images, use the "Direct Link" format.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-1">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell people about your application..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 transition-all text-sm font-medium resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-1">
              {type === 'url' ? 'Target Web Address' : type === 'drive' ? 'Google Drive Link' : 'GitHub Repository URL'}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={type === 'url' ? 'https://example.com' : type === 'drive' ? 'https://drive.google.com/file/d/ID/view' : 'https://github.com/user/repo'}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
              />
            </div>
            <p className="text-[10px] text-white/20 mt-2 px-1 leading-relaxed">
              {type === 'drive' && "For best results, use a 'File Link' instead of a folder link. Ensure sharing is set to 'Anyone with the link'."}
              {type === 'url' && "Pro tip: Use a hosted link (GitHub Pages/Vercel) for immediate execution."}
              {type === 'github' && "Direct repository link for source code exploration. Single HTML files will be rendered automatically."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-1 flex items-center gap-2">
              <Code size={12} /> Build / Run Instructions (Optional)
            </label>
            <textarea 
              value={buildInstructions}
              onChange={e => setBuildInstructions(e.target.value)}
              placeholder="e.g., npm install && npm run dev"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 transition-all text-sm font-mono text-blue-300/60 resize-none"
            />
            <p className="text-[9px] text-white/15 px-1 italic">
              Visible on the app launch screen to help others run your code locally.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isPublishing}
            className={`w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPublishing ? 'Broadcasting...' : 'Publish to Aether'}
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
