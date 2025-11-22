import React, { useState } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { PolaroidEditor } from './components/PolaroidEditor';
import { Gallery } from './components/Gallery';
import { PolaroidData, AppState } from './types';
import { Image as ImageIcon, Aperture, Camera } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [savedPolaroids, setSavedPolaroids] = useState<PolaroidData[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const handleCapture = (imageData: string) => {
    setCurrentImage(imageData);
    setAppState('developing');
  };

  const handleSave = (data: PolaroidData) => {
    setSavedPolaroids(prev => [data, ...prev]);
    setAppState('idle');
    setCurrentImage(null);
  };

  const handleDiscard = () => {
    setAppState('idle');
    setCurrentImage(null);
  };

  const handleDelete = (id: string) => {
    setSavedPolaroids(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-x-hidden">
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Aperture className="text-white w-6 h-6 animate-spin-slow" />
           </div>
           <h1 className="text-2xl font-bold tracking-tight hidden sm:block">
             Retro<span className="text-yellow-500">Snap</span>
           </h1>
        </div>
        
        <button 
          onClick={() => setShowGallery(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-all border border-zinc-700 hover:border-zinc-600"
        >
          <ImageIcon className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium">Gallery ({savedPolaroids.length})</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
        
        {appState === 'idle' && (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
               <h2 className="text-4xl font-marker text-white/90 mb-2">Capture the Moment</h2>
               <p className="text-zinc-500">Take a photo to start the instant developing process.</p>
            </div>
            <div className="h-[60vh] min-h-[400px]">
               <CameraCapture onCapture={handleCapture} />
            </div>
          </div>
        )}

        {(appState === 'developing' || appState === 'editing') && currentImage && (
          <div className="w-full animate-in slide-in-from-bottom-10 duration-500">
            <PolaroidEditor 
              imageData={currentImage} 
              onSave={handleSave}
              onDiscard={handleDiscard}
            />
          </div>
        )}

      </main>

      {/* Gallery Modal */}
      {showGallery && (
        <Gallery 
          items={savedPolaroids} 
          onClose={() => setShowGallery(false)} 
          onDelete={handleDelete}
        />
      )}

    </div>
  );
};

export default App;
