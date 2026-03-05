
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import {ArrowPathIcon, DownloadIcon, PlusIcon, PencilIcon} from './icons';

interface ImageResultProps {
  imageUrl: string; // Default/First image
  candidates?: string[];
  onRetry: () => void;
  onNew: () => void;
  onEdit: () => void;
}

const ImageResult: React.FC<ImageResultProps> = ({
  imageUrl,
  candidates,
  onRetry,
  onNew,
  onEdit,
}) => {
  const [selectedUrl, setSelectedUrl] = useState(imageUrl);

  useEffect(() => {
    // If candidates exist and we haven't selected one or the prop changed, default to first
    if (candidates && candidates.length > 0) {
       // if current selectedUrl is not in candidates, reset to first
       const exists = candidates.includes(selectedUrl);
       if (!exists) {
         setSelectedUrl(candidates[0]);
       }
    } else {
       setSelectedUrl(imageUrl);
    }
  }, [candidates, imageUrl]);

  return (
    <div className="w-full relative flex flex-col items-center clay-card animate-fadeIn">
       
      <div className="flex w-full justify-between items-center mb-8">
          <button
            onClick={onNew}
            className="clay-btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5"
          >
            <PlusIcon className="w-3 h-3" />
            New
          </button>
          
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse"></div>
             <span className="text-xs font-mono text-[var(--text-secondary)]">IMAGE GENERATED</span>
          </div>
      </div>

      <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden neu-pressed p-2 group">
        <img
          src={selectedUrl}
          alt="Generated Output"
          className="w-full h-full object-contain rounded-2xl"
        />
      </div>

      {/* Thumbnails if multiple candidates */}
      {candidates && candidates.length > 1 && (
        <div className="flex gap-4 mt-8">
          {candidates.map((candidateUrl, idx) => (
             <button
               key={idx}
               onClick={() => setSelectedUrl(candidateUrl)}
               className={`w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 ${
                 selectedUrl === candidateUrl 
                   ? 'neu-flat scale-110 ring-2 ring-[var(--primary-color)] ring-offset-2 ring-offset-[var(--bg-color)]' 
                   : 'neu-pressed opacity-60 hover:opacity-100 hover:scale-105'
               }`}
             >
                <img 
                  src={candidateUrl} 
                  alt={`Option ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                />
             </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-8 w-full">
        <button
          onClick={onRetry}
          className="flex-1 min-w-[140px] clay-btn-secondary flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-all hover:-translate-y-1"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Retry
        </button>

        <button
          onClick={onEdit}
          className="flex-1 min-w-[140px] clay-btn-secondary flex items-center justify-center gap-2 px-6 py-4 text-[var(--accent-color)] font-bold text-sm transition-all hover:-translate-y-1"
        >
          <PencilIcon className="w-4 h-4" />
          Edit Prompt
        </button>
        
        <a
          href={selectedUrl}
          download="firebean-image.png"
          className="flex-[2] min-w-[200px] clay-btn-primary flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-all hover:-translate-y-1"
        >
          <DownloadIcon className="w-4 h-4" />
          Download PNG
        </a>
      </div>
    </div>
  );
};

export default ImageResult;
