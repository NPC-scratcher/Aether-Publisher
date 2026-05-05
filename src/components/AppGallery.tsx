import React from 'react';
import { deleteDoc, doc, collection, query, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase';
import { Play, User, Calendar, ExternalLink, Search, Plus, Trash2, Globe, FolderOpen, Github } from 'lucide-react';
import { motion } from 'motion/react';

interface AppGalleryProps {
  onOpenApp: (id: string) => void;
  onPublish: () => void;
}

export const AppGallery: React.FC<AppGalleryProps> = ({ onOpenApp, onPublish }) => {
  const appsRef = collection(db, 'apps');
  const q = query(appsRef, orderBy('createdAt', 'desc'));
  const [apps, loading, error] = useCollectionData(q, { idField: 'id' } as any);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this app?')) return;
    try {
      await deleteDoc(doc(db, 'apps', id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete app.');
    }
  };

  if (loading) return <div className="p-20 text-center text-white/20 uppercase tracking-[0.3em] font-bold animate-pulse">Loading Apps...</div>;
  if (error) return <div className="p-20 text-center text-rose-500">Error loading community apps.</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter mb-2">Community Gallery</h2>
          <p className="text-white/30 text-sm">Discover and run applications built by other creators.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search web apps..."
            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-80 outline-none focus:border-blue-500/50 transition-all text-sm"
          />
        </div>
      </div>

      {!apps || apps.length === 0 ? (
        <div 
          onClick={auth.currentUser ? onPublish : undefined}
          className={`h-[40vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all ${auth.currentUser ? 'cursor-pointer hover:bg-blue-500/5' : ''}`}
        >
          <div className="bg-blue-600/10 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-blue-500" size={32} />
          </div>
          <p className="text-white/20 font-bold uppercase tracking-widest text-xs">
            {auth.currentUser ? 'Be the first to publish an app!' : 'Sign in to publish the first app'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Publish Card */}
          {auth.currentUser && (
            <motion.div 
              key="publish-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              onClick={onPublish}
              className="group bg-blue-600/5 border-2 border-dashed border-blue-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-600/10 hover:border-blue-500/40 transition-all shadow-xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Publish New App</h3>
              <p className="text-blue-100/30 text-xs leading-relaxed max-w-[200px]">Share your HTML/JS code with the community for everyone to run.</p>
            </motion.div>
          )}

          {apps.map((app: any) => (
            <motion.div 
              key={app.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="group bg-white/2 border border-white/5 rounded-3xl p-6 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer shadow-xl relative overflow-hidden"
              onClick={() => onOpenApp(app.id)}
            >
              {/* Type Badge */}
              <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[9px] font-bold uppercase tracking-widest 
                ${app.type === 'drive' ? 'bg-amber-600/20 text-amber-500' : 
                  app.type === 'github' ? 'bg-purple-600/20 text-purple-500' : 
                  'bg-blue-600/20 text-blue-500'}`}>
                {app.type === 'drive' ? 'Drive' : app.type === 'github' ? 'GitHub' : 'Web'}
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  {app.logoUrl ? (
                    <img src={app.logoUrl} className="w-full h-full object-cover" alt="Logo" referrerPolicy="no-referrer" />
                  ) : (
                    <div className={`p-3 rounded-xl ${app.type === 'drive' ? 'bg-amber-600/20' : app.type === 'github' ? 'bg-purple-600/20' : 'bg-blue-600/20'}`}>
                      {app.type === 'drive' ? <FolderOpen size={24} className="text-amber-400" /> : 
                       app.type === 'github' ? <Github size={24} className="text-purple-400" /> : 
                       <Globe size={24} className="text-blue-400" />}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-col items-end text-[10px] uppercase font-bold tracking-widest text-white/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User size={10} />
                      {app.authorName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} />
                      {app.createdAt?.seconds 
                        ? new Date(app.createdAt.seconds * 1000).toLocaleDateString()
                        : app.createdAt 
                          ? new Date(app.createdAt).toLocaleDateString()
                          : 'Recent'}
                    </div>
                  </div>
                  
                  {auth.currentUser?.uid === app.authorId && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(app.id);
                      }}
                      className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                      title="Delete App"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors truncate pr-12">{app.name}</h3>
              <p className="text-sm text-white/40 mb-6 line-clamp-2 leading-relaxed h-10">
                {app.description || 'No description provided.'}
              </p>

              <button className="w-full py-3 bg-white/5 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-600/20">
                Access Application <ExternalLink size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
