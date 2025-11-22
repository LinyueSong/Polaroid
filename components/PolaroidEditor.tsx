import React, { useState, useEffect } from 'react';
import { FilterType, FilterConfig, PolaroidData } from '../types';
import { FILTERS } from '../constants';
import { generatePolaroidCaption, editPolaroidImage } from '../services/geminiService';
import { Sparkles, Save, Trash2, Download, PenTool, RefreshCw, Wand2, X } from 'lucide-react';
import { createDownloadablePolaroid } from '../utils/canvasUtils';

interface PolaroidEditorProps {
  imageData: string;
  onSave: (data: PolaroidData) => void;
  onDiscard: () => void;
}

export const PolaroidEditor: React.FC<PolaroidEditorProps> = ({ imageData, onSave, onDiscard }) => {
  // Local state for the image to allow AI edits
  const [currentImageData, setCurrentImageData] = useState(imageData);
  
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(FilterType.NORMAL);
  const [caption, setCaption] = useState('');
  
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [showEditInput, setShowEditInput] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  
  const [isDeveloping, setIsDeveloping] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Animation Timers
  useEffect(() => {
    // The photo "develops" for 5 seconds.
    const developTimer = setTimeout(() => {
        setIsDeveloping(false);
        setShowControls(true);
    }, 5000); // Matches the CSS 'animate-develop' duration

    return () => {
        clearTimeout(developTimer);
    };
  }, []);

  const handleGenerateCaption = async () => {
    if (!process.env.API_KEY) {
        alert("Please provide an API Key to use AI features.");
        return;
    }
    setIsGeneratingCaption(true);
    try {
      // Generate caption based on the CURRENT (potentially edited) image
      const generated = await generatePolaroidCaption(currentImageData);
      setCaption(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleMagicEdit = async () => {
    if (!editPrompt.trim()) return;
    if (!process.env.API_KEY) {
        alert("Please provide an API Key to use AI features.");
        return;
    }

    setIsEditingImage(true);
    try {
        const newImage = await editPolaroidImage(currentImageData, editPrompt);
        if (newImage) {
            setCurrentImageData(newImage);
            setShowEditInput(false);
            setEditPrompt('');
        } else {
            alert("Could not modify the image. Please try a different prompt.");
        }
    } catch (e) {
        console.error(e);
        alert("Error connecting to AI service.");
    } finally {
        setIsEditingImage(false);
    }
  };

  const handleDownload = async () => {
    try {
        const url = await createDownloadablePolaroid(currentImageData, caption, FILTERS[selectedFilter]);
        const link = document.createElement('a');
        link.href = url;
        link.download = `retro-snap-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Download failed", e);
    }
  };

  const handleSaveToGallery = () => {
      onSave({
          id: Date.now().toString(),
          imageData: currentImageData,
          caption,
          filter: selectedFilter,
          timestamp: Date.now()
      });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center w-full max-w-6xl mx-auto p-4">
      
      {/* The Polaroid Preview */}
      <div className="flex-shrink-0 perspective-1000 relative z-10">
        {/* Printer Slot Visual Cue */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-2 bg-zinc-800 rounded-full opacity-50 blur-sm"></div>

        <div className="animate-eject relative bg-white p-4 pb-16 shadow-2xl origin-top" style={{ width: '320px', minHeight: '400px' }}>
            
            {/* Inner Dark Frame */}
            <div className="bg-zinc-900 w-full aspect-square relative overflow-hidden border border-gray-200 group">
               <img 
                 src={currentImageData} 
                 alt="Developed" 
                 className={`w-full h-full object-cover transition-all duration-500 
                    ${isDeveloping ? 'animate-develop' : FILTERS[selectedFilter].class}
                    ${isEditingImage ? 'opacity-50 blur-sm' : ''}
                 `}
               />
               
               {/* Loading Overlay for Editing */}
               {isEditingImage && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                       <RefreshCw className="w-8 h-8 text-white animate-spin mb-2" />
                       <span className="text-white text-xs font-medium shadow-black drop-shadow-md">Developing Magic...</span>
                   </div>
               )}
               
               {/* Vignette & Texture Overlay (Always present) */}
               <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] mix-blend-multiply"></div>
               <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/20"></div>
            </div>

            {/* Caption Area */}
            <div className="mt-4 w-full min-h-[3rem] flex items-center justify-center px-2 relative">
                <div className={`transition-opacity duration-1000 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <input 
                        type="text" 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption..."
                        className="w-full text-center font-handwriting text-2xl text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-400 focus:outline-none placeholder-gray-300 transition-colors"
                        maxLength={40}
                    />
                </div>
                {isDeveloping && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-handwriting opacity-50">
                        ...
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Controls Panel - Fades in after development */}
      <div className={`flex flex-col w-full max-w-md space-y-8 transition-all duration-1000 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        
        {/* Filter Selector */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg">
            <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Filters
            </h3>
            <div className="grid grid-cols-4 gap-2">
                {Object.values(FILTERS).map((f) => (
                    <button
                        key={f.name}
                        onClick={() => setSelectedFilter(f.name)}
                        className={`
                            relative group overflow-hidden rounded-lg aspect-square border-2 transition-all
                            ${selectedFilter === f.name ? 'border-yellow-500 scale-105' : 'border-zinc-700 hover:border-zinc-500'}
                        `}
                    >
                        <img src={currentImageData} className={`w-full h-full object-cover absolute inset-0 ${f.class}`} alt={f.name} />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[10px] text-white text-center py-1 backdrop-blur-sm">
                            {f.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        {/* AI Actions */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg">
            <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <PenTool className="w-4 h-4" /> Magic Tools
            </h3>
            
            <div className="space-y-3">
                {/* Caption Generation */}
                <button 
                    onClick={handleGenerateCaption}
                    disabled={isGeneratingCaption || isEditingImage}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
                >
                    {isGeneratingCaption ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Dreaming up caption...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" /> Generate AI Caption
                        </>
                    )}
                </button>

                {/* Magic Edit Toggle */}
                {!showEditInput ? (
                    <button 
                        onClick={() => setShowEditInput(true)}
                        disabled={isEditingImage || isGeneratingCaption}
                        className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border border-zinc-700"
                    >
                        <Wand2 className="w-4 h-4 text-yellow-400" /> Magic Edit Image
                    </button>
                ) : (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-700 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs text-zinc-400">Describe change (e.g., "add sunglasses")</label>
                            <button onClick={() => setShowEditInput(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <textarea 
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-yellow-500 mb-2 resize-none h-20"
                            placeholder="Turn day into night..."
                        />
                        <button 
                            onClick={handleMagicEdit}
                            disabled={!editPrompt.trim() || isEditingImage}
                            className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {isEditingImage ? 'Developing...' : 'Transform'}
                        </button>
                    </div>
                )}
            </div>

             <p className="text-xs text-zinc-500 mt-3 text-center">
                Powered by Gemini 2.5 Flash & NanoBanana
            </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
            <button 
                onClick={onDiscard}
                className="flex-1 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Discard
            </button>
            <button 
                onClick={handleDownload}
                className="flex-1 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
                <Download className="w-4 h-4" /> Download
            </button>
             <button 
                onClick={handleSaveToGallery}
                className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20"
            >
                <Save className="w-4 h-4" /> Save
            </button>
        </div>

      </div>
    </div>
  );
};