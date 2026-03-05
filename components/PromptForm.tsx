
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import CameraControl from './CameraControl';
import {
  GenerateParams,
  GenerationMode,
  ImageFile,
  ImageModel,
} from '../types';
import { describeImage } from '../services/geminiService';
import {
  ChevronDownIcon,
  ClipboardIcon,
  CopyIcon,
  ImageIcon,
  PaletteIcon,
  PlusIcon,
  ScanEyeIcon,
  SparklesIcon,
  XMarkIcon,
} from './icons';

const styles = [
  { value: 'none', label: 'No Style' },
  { value: 'funny', label: 'Funny / Comedic' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'surreal', label: 'Surreal' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
];

const fileToBase64 = <T extends {file: File; base64: string}>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64} as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
  fileToBase64<ImageFile>(file);

const CustomSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({label, value, onChange, icon, children, disabled = false}) => (
  <div className="flex flex-col">
    <label
      className={`text-[10px] uppercase tracking-widest font-bold mb-2 ml-1 ${
        disabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'
      }`}>
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-secondary)] group-hover:text-[var(--primary-color)] transition-colors">
        {icon}
      </div>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full clay-input pl-10 pr-8 py-3 text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
        {children}
      </select>
      <ChevronDownIcon
        className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
          disabled ? 'text-gray-400' : 'text-[var(--text-secondary)]'
        }`}
      />
    </div>
  </div>
);

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
  className?: string;
  accentColor?: string;
}> = ({onSelect, onRemove, image, label, className = "w-full h-32", accentColor = "border-gray-600"}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        try {
            const imageFile = await fileToImageFile(file);
            onSelect(imageFile);
        } catch (error) {
            console.error('Error processing dropped file:', error);
        }
    }
  };

  if (image) {
    return (
      <div 
        className={`relative group ${className} rounded-xl overflow-hidden neu-flat p-1 transition-all duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <img
          src={URL.createObjectURL(image.file)}
          alt="preview"
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <button
            type="button"
            onClick={onRemove}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-lg"
            aria-label="Remove image">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {isDragging && (
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none rounded-lg">
              <span className="text-white font-bold text-xs uppercase tracking-widest">Replace</span>
           </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${className} neu-pressed hover:neu-flat rounded-xl flex flex-col items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-300 group border-2 border-transparent ${isDragging ? 'border-[var(--primary-color)]' : ''}`}>
      <div className={`p-3 rounded-full neu-flat group-hover:scale-110 transition-transform mb-2 ${isDragging ? 'scale-110' : ''}`}>
        <PlusIcon className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-center px-2">{isDragging ? 'Drop Image Here' : label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateParams) => void;
  initialValues?: GenerateParams | null;
  defaultImageModel?: ImageModel;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  initialValues,
  defaultImageModel = ImageModel.LITE,
}) => {
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '');
  const [imageModel, setImageModel] = useState<ImageModel>(
    initialValues?.imageModel ?? defaultImageModel,
  );
  const [generationMode, setGenerationMode] = useState<GenerationMode>(
    initialValues?.mode ?? GenerationMode.TEXT_TO_IMAGE,
  );
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>(
    initialValues?.referenceImages ?? [],
  );
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [isDescribing, setIsDescribing] = useState(false);
  
  useEffect(() => {
    if (!initialValues) {
      setImageModel(defaultImageModel);
    }
  }, [defaultImageModel, initialValues]);
  const [style, setStyle] = useState('none');
  const [cameraAnglePrompt, setCameraAnglePrompt] = useState('');
  
  const [copySuccess, setCopySuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValues) {
      setPrompt(initialValues.prompt ?? '');
      setImageModel(initialValues.imageModel ?? ImageModel.LITE);
      setReferenceImages(initialValues.referenceImages ?? []);
    }
  }, [initialValues]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPrompt(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleDescribe = useCallback(async () => {
    if (!sourceImage) return;
    
    setIsDescribing(true);
    try {
      const description = await describeImage(sourceImage);
      setPrompt(description);
    } catch (error) {
      console.error('Failed to describe image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsDescribing(false);
    }
  }, [sourceImage]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      let finalPrompt = prompt;
      if (style && style !== 'none') {
        finalPrompt += ` in a ${style} style`;
      }
      if (cameraAnglePrompt) {
        finalPrompt += `, ${cameraAnglePrompt}`;
      }

      onGenerate({
        prompt: finalPrompt,
        imageModel,
        mode: generationMode,
        referenceImages,
      });
    },
    [
      prompt,
      imageModel,
      generationMode,
      referenceImages,
      onGenerate,
      style,
      cameraAnglePrompt,
      handleDescribe,
    ],
  );

  const promptPlaceholder = 'Describe the image you want to generate (or edit)...';

  const renderMediaUploads = () => {
    if (generationMode === GenerationMode.IMAGE_TO_PROMPT) {
      return (
        <div className="mb-6 p-6 rounded-3xl neu-concave">
          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-4">
            Image to Analyze
          </label>
          <div className="flex items-center gap-8">
            <ImageUpload
              label="Upload Image"
              image={sourceImage}
              onSelect={setSourceImage}
              onRemove={() => setSourceImage(null)}
              className="w-48 h-32"
            />
            <div className="flex-1">
               <button
                 type="button"
                 onClick={handleDescribe}
                 disabled={isDescribing || !sourceImage}
                 className={`w-full py-4 font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all
                 ${isDescribing || !sourceImage ? 'clay-btn-secondary opacity-50 cursor-not-allowed' : 'clay-btn-primary hover:-translate-y-1 active:scale-95'}
                 `}
               >
                 <SparklesIcon className={`w-5 h-5 ${isDescribing ? 'animate-spin' : ''}`} />
                 {isDescribing ? 'Analyzing...' : 'Describe Image'}
               </button>
               <p className="mt-3 text-[10px] text-[var(--text-secondary)] text-center uppercase tracking-widest font-medium opacity-60">
                 AI will describe your image below
               </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6 p-6 rounded-3xl neu-concave">
        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-4 text-center">
          Reference Images (Optional)
        </label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {referenceImages.map((img, index) => (
            <ImageUpload
              key={index}
              image={img}
              label=""
              onSelect={(newImg) => {
                const newImages = [...referenceImages];
                newImages[index] = newImg;
                setReferenceImages(newImages);
              }}
              onRemove={() =>
                setReferenceImages((imgs) => imgs.filter((_, i) => i !== index))
              }
              className="w-full h-24"
            />
          ))}
          <ImageUpload
            label="Add Photo"
            onSelect={(img) => setReferenceImages((imgs) => [...imgs, img])}
            className="w-full h-24"
          />
        </div>
      </div>
    );
  };

  let isSubmitDisabled = !prompt.trim();

  const buttonText = 'Generate Image';

  return (
    <div className="w-full space-y-8">
      
      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          type="button"
          onClick={() => setGenerationMode(GenerationMode.TEXT_TO_IMAGE)}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all ${
            generationMode === GenerationMode.TEXT_TO_IMAGE
              ? 'clay-btn-primary'
              : 'clay-btn-secondary'
          }`}
        >
          <ImageIcon className="w-6 h-6" />
          Generate Image
        </button>
        <button
          type="button"
          onClick={() => setGenerationMode(GenerationMode.IMAGE_TO_PROMPT)}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all ${
            generationMode === GenerationMode.IMAGE_TO_PROMPT
              ? 'clay-btn-primary'
              : 'clay-btn-secondary'
          }`}
        >
          <ScanEyeIcon className="w-6 h-6" />
          Image to Prompt
        </button>
      </div>

      {/* 2. Main Input Card */}
      <form onSubmit={handleSubmit} className="clay-card relative">
        
        {/* Render Dropzones if needed */}
        {renderMediaUploads()}

        {/* Text Prompt */}
        <div className="relative group mb-6">
           <div className="flex justify-between items-end mb-2 px-1">
             <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">
               {generationMode === GenerationMode.IMAGE_TO_PROMPT ? 'AI Analysis Result' : 'Image Description'}
             </label>
           </div>
           <div className="relative">
             <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={generationMode === GenerationMode.IMAGE_TO_PROMPT ? 'The AI description will appear here...' : promptPlaceholder}
              className={`w-full clay-input min-h-[120px] max-h-60 resize-none text-lg pr-24`}
              rows={2}
            />
            <div className="absolute top-3 right-3 flex gap-1">
               {/* Paste Button */}
               <button
                  type="button"
                  onClick={handlePaste}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all flex items-center gap-1"
                  title="Paste from Clipboard"
               >
                  <ClipboardIcon className="w-4 h-4" />
               </button>
               {/* Copy Button */}
               <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!prompt}
                  className={`p-2 rounded-lg transition-all flex items-center gap-1 ${copySuccess ? 'text-green-600' : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)]'}`}
                  title="Copy to Clipboard"
               >
                  <CopyIcon className="w-4 h-4" />
                  {copySuccess && <span className="text-xs">Copied!</span>}
               </button>
            </div>
           </div>
        </div>
        
        {/* Camera Control */}
        {generationMode !== GenerationMode.IMAGE_TO_PROMPT && (
          <div className="mb-6 p-6 rounded-3xl neu-concave">
              <CameraControl onChange={setCameraAnglePrompt} />
          </div>
        )}

        {/* 3. Settings Panel */}
        {generationMode !== GenerationMode.IMAGE_TO_PROMPT && (
          <div className="mb-8">
            <div className="p-6 rounded-3xl neu-concave grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                    label="Visual Style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    icon={<PaletteIcon className="w-4 h-4" />}>
                    {styles.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                    ))}
                </CustomSelect>
            </div>
          </div>
        )}
        
        {/* 4. Action Button */}
        <div>
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-4 font-bold text-lg tracking-widest uppercase transition-all duration-300 transform active:scale-[0.99]
                ${isSubmitDisabled 
                    ? 'clay-btn-secondary opacity-50 cursor-not-allowed' 
                    : 'clay-btn-primary hover:-translate-y-1'
                }
                `}
            >
                {buttonText}
            </button>
        </div>
      </form>
    </div>
  );
};

export default PromptForm;
