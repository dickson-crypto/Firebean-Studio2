
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Initializing Image Generation Model...",
  "Calibrating Flux Capacitors...",
  "Rendering Pixels...",
  "Applying Artistic Filters...",
  "Consulting the AI Director...",
  "Generating Soft Glows...",
  "Processing Light Rays...",
  "Almost there, stay tuned...",
  "Adding cinematic grain...",
  "Polishing frames..."
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="clay-card flex flex-col items-center justify-center p-12 max-w-md w-full animate-fadeIn">
      <div className="relative w-24 h-24 mb-8">
         <div className="absolute inset-0 rounded-full border-4 border-[var(--bg-color)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]"></div>
         <div className="absolute inset-0 rounded-full border-4 border-t-[var(--primary-color)] border-r-[var(--secondary-color)] border-b-transparent border-l-transparent animate-spin"></div>
         <div className="absolute inset-4 rounded-full border-4 border-t-[var(--accent-color)] border-l-[var(--accent-color)] border-b-transparent border-r-transparent animate-spin-reverse opacity-70"></div>
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-widest">
        GENERATING
      </h2>
      <p className="text-[var(--text-secondary)] text-sm font-mono tracking-wide text-center h-6">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;
