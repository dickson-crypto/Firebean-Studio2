
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import ImageResult from './components/ImageResult';
import {generateImage} from './services/geminiService';
import {
  AppState,
  GenerateParams,
  GenerationMode,
  ImageModel,
} from './types';
import {ImageIcon, Settings2Icon} from './components/icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [imageCandidates, setImageCandidates] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<GenerateParams | null>(
    null,
  );
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel>(ImageModel.LITE);

  const [initialFormValues, setInitialFormValues] =
    useState<GenerateParams | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          console.warn(
            'aistudio.hasSelectedApiKey check failed',
            error,
          );
        }
      }
    };
    checkApiKey();
  }, []);

  const handleGenerate = useCallback(async (params: GenerateParams) => {
    const isPaidModel = 
      params.imageModel === ImageModel.NANO_2;

    if (isPaidModel && window.aistudio) {
      try {
        if (!(await window.aistudio.hasSelectedApiKey())) {
          setShowApiKeyDialog(true);
          return;
        }
      } catch (error) {
        console.warn(
          'aistudio.hasSelectedApiKey check failed, assuming no key selected.',
          error,
        );
        setShowApiKeyDialog(true);
        return;
      }
    }

    setAppState(AppState.LOADING);
    setErrorMessage(null);
    setLastConfig(params);
    setInitialFormValues(null);
    setImageCandidates([]);

    try {
      const candidates = await generateImage(params);
      if (candidates.length > 0) {
        setResultUrl(candidates[0]);
        setImageCandidates(candidates);
        setAppState(AppState.SUCCESS);
      } else {
        throw new Error('No images were generated.');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';

      let userFriendlyMessage = `Generation failed: ${errorMessage}`;
      let shouldOpenDialog = false;

      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('Requested entity was not found.')) {
          userFriendlyMessage =
            'Model not found. This can be caused by an invalid API key or permission issues. Please check your API key.';
          shouldOpenDialog = true;
        } else if (
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('API key not valid') ||
          errorMessage.toLowerCase().includes('permission denied') ||
          errorMessage.includes('403') ||
          errorMessage.includes('API Key must be set')
        ) {
          userFriendlyMessage =
            'Your API key is invalid or lacks permissions. Please select a valid, billing-enabled API key.';
          shouldOpenDialog = true;
        }
      }

      setErrorMessage(userFriendlyMessage);
      setAppState(AppState.ERROR);

      if (shouldOpenDialog) {
        setShowApiKeyDialog(true);
      }
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastConfig) {
      handleGenerate(lastConfig);
    }
  }, [lastConfig, handleGenerate]);

  const handleEdit = useCallback(() => {
    if (lastConfig) {
      setInitialFormValues(lastConfig);
      setAppState(AppState.IDLE);
      setResultUrl(null);
      setErrorMessage(null);
      setImageCandidates([]);
    }
  }, [lastConfig]);

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    if (appState === AppState.ERROR && lastConfig) {
      handleRetry();
    }
  };

  const handleNewImage = useCallback(() => {
    setAppState(AppState.IDLE);
    setResultUrl(null);
    setErrorMessage(null);
    setLastConfig(null);
    setInitialFormValues(null);
    setImageCandidates([]);
  }, []);

  const handleTryAgainFromError = useCallback(() => {
    if (lastConfig) {
      setInitialFormValues(lastConfig);
      setAppState(AppState.IDLE);
      setErrorMessage(null);
    } else {
      handleNewImage();
    }
  }, [lastConfig, handleNewImage]);

  const renderError = (message: string) => (
    <div className="text-center clay-card max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-red-500 mb-4">System Glitch</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={handleTryAgainFromError}
        className="clay-btn-primary px-8 py-3 font-semibold tracking-wide bg-red-400">
        Reboot System
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden bg-[var(--bg-color)] text-[var(--text-primary)]">
      
      {showApiKeyDialog && (
        <ApiKeyDialog 
          onContinue={handleApiKeyDialogContinue} 
          onClose={() => setShowApiKeyDialog(false)}
        />
      )}
      
      <header className="pt-8 pb-4 flex items-center justify-center px-8 relative z-10">
        <div className="neu-flat px-8 py-4 flex items-center gap-4">
          <h1 className="text-4xl font-black tracking-tighter text-center text-[var(--text-primary)]">
            Firebean
            <span className="font-light opacity-80 ml-2">Studio</span>
            <span className="ml-2 neon-emboss-red">2</span>
          </h1>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto flex-grow flex flex-col relative z-10 px-4">
        {appState === AppState.IDLE ? (
          <div className="flex-grow flex flex-col justify-center">
             <div className="mb-4">
              <PromptForm
                onGenerate={handleGenerate}
                initialValues={initialFormValues}
                defaultImageModel={selectedImageModel}
              />
             </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            {appState === AppState.LOADING && <LoadingIndicator />}
            
            {appState === AppState.SUCCESS && (
              <ImageResult
                imageUrl={resultUrl || ''}
                candidates={imageCandidates}
                onRetry={handleRetry}
                onEdit={handleEdit}
                onNew={handleNewImage}
              />
            )}

            {appState === AppState.SUCCESS &&
              !resultUrl &&
              imageCandidates.length === 0 &&
              renderError(
                'Media generated, but URL is missing. Please try again.',
              )}
            {appState === AppState.ERROR &&
              errorMessage &&
              renderError(errorMessage)}
          </div>
        )}
      </main>

      {/* Model Selector Footer */}
      <footer className="w-full py-6 px-4 relative z-20 mt-8">
        <div className="max-w-3xl mx-auto neu-flat p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full neu-pressed">
              <Settings2Icon className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">AI Model Engine</h3>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-medium">System Configuration</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* Image Model Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Image Generation</label>
              <div className="flex neu-pressed p-1 rounded-xl">
                <button
                  onClick={() => setSelectedImageModel(ImageModel.LITE)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedImageModel === ImageModel.LITE
                      ? 'bg-[var(--bg-color)] text-[var(--primary-color)] shadow-[5px_5px_10px_var(--shadow-dark),-5px_-5px_10px_var(--shadow-light)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Lite 2.5
                </button>
                <button
                  onClick={() => setSelectedImageModel(ImageModel.NANO_2)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedImageModel === ImageModel.NANO_2
                      ? 'bg-[var(--bg-color)] text-[var(--primary-color)] shadow-[5px_5px_10px_var(--shadow-dark),-5px_-5px_10px_var(--shadow-light)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Nano Banana 2
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block text-right">
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">v2.5.0-STABLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default App;
