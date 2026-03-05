
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}



export enum ImageModel {
  LITE = 'gemini-2.5-flash-image',
  NANO_2 = 'gemini-3.1-flash-image-preview',
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4k',
}

export enum GenerationMode {
  TEXT_TO_IMAGE = 'Text to Image',
  IMAGE_TO_PROMPT = 'Image to Prompt',
}

export interface ImageFile {
  file: File;
  base64: string;
}



export interface GenerateParams {
  prompt: string;
  imageModel: ImageModel;
  mode: GenerationMode;
  referenceImages?: ImageFile[];
}
