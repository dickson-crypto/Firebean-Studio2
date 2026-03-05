import React from 'react';
import { KeyIcon } from './icons';

interface ApiKeyDialogProps {
  onContinue: () => void;
  onClose?: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="clay-card max-w-lg w-full p-8 text-center flex flex-col items-center relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
        <div className="neu-pressed p-6 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-[var(--primary-color)]" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Paid API Key Required</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          High-quality image generation models (like Nano Banana 2) require a paid API key. To use these features, please select an API key associated with a paid Google Cloud project that has billing enabled.
        </p>
        <p className="text-[var(--text-secondary)] mb-8 text-sm opacity-80">
          For more information, see the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-color)] hover:underline font-medium"
          >
            how to enable billing
          </a>{' '}
          and{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-color)] hover:underline font-medium"
          >
            Gemini pricing
          </a>.
        </p>
        <button
          onClick={onContinue}
          className="w-full clay-btn-primary px-6 py-4 font-bold text-lg tracking-wide transition-transform hover:-translate-y-1"
        >
          Continue to Select a Paid API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
