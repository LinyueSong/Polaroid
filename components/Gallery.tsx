import React from 'react';
import { PolaroidData } from '../types';
import { FILTERS } from '../constants';
import { Download, Trash2, X } from 'lucide-react';
import { createDownloadablePolaroid } from '../utils/canvasUtils';

interface GalleryProps {
    items: PolaroidData[];
    onClose: () => void;
    onDelete: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ items, onClose, onDelete }) => {
  
  const handleDownload = async (item: PolaroidData) => {
      try {
        const url = await createDownloadablePolaroid(item.imageData, item.caption, FILTERS[item.filter]);
        const link = document.createElement('a');
        link.href = url;
        link.download = `retro-snap-${item.timestamp}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch(e) {
          console.error(e);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col overflow-hidden animate-in fade-in duration-200">
        <div className="p-6 flex items-center justify-between border-b border-white/10">
            <h2 className="text-2xl font-marker text-yellow-500 tracking-wide">Photo Lab Gallery</h2>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <X className="w-8 h-8" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <p className="text-xl">No photos yet.</p>
                    <p className="text-sm mt-2">Go snap some memories!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 pb-20">
                    {items.map((item, index) => (
                        <div key={item.id} className="group relative flex flex-col items-center">
                             {/* Polaroid Item */}
                             <div className={`
                                bg-white p-3 pb-12 shadow-xl transform transition-transform hover:scale-105 hover:z-10 duration-300
                                ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}
                             `} style={{ width: '100%', maxWidth: '280px' }}>
                                <div className="aspect-square bg-zinc-100 overflow-hidden border border-gray-100">
                                     <img 
                                        src={item.imageData} 
                                        className={`w-full h-full object-cover ${FILTERS[item.filter].class}`} 
                                        alt="Memory" 
                                     />
                                </div>
                                <div className="mt-3 text-center px-2">
                                    <p className="font-handwriting text-xl text-gray-800 truncate">
                                        {item.caption || "Untitled"}
                                    </p>
                                </div>
                             </div>

                             {/* Actions Overlay */}
                             <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg pointer-events-none group-hover:pointer-events-auto">
                                 <button 
                                    onClick={() => handleDownload(item)}
                                    className="p-3 bg-white text-black rounded-full shadow-lg hover:bg-gray-200 transition-transform hover:scale-110"
                                    title="Download"
                                 >
                                     <Download className="w-5 h-5" />
                                 </button>
                                 <button 
                                    onClick={() => onDelete(item.id)}
                                    className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                                    title="Delete"
                                 >
                                     <Trash2 className="w-5 h-5" />
                                 </button>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
