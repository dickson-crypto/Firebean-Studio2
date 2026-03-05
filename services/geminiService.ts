
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GenerateParams, GenerationMode, ImageFile, ImageModel} from '../types';

/**
 * Helper to retry operations with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check for retryable errors (503 Service Unavailable, 429 Too Many Requests, or specific messages)
      const isOverloaded = 
        error?.status === 503 || 
        error?.code === 503 ||
        error?.status === 429 ||
        error?.code === 429 ||
        (typeof error?.message === 'string' && (error.message.includes('overloaded') || error.message.includes('503')));

      if (isOverloaded && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // 2s, 4s, 8s
        console.warn(`Gemini API overloaded (Attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      
      // If not retryable or max retries reached, throw
      throw error;
    }
  }
  throw lastError;
}

export const describeImage = async (image: ImageFile): Promise<string> => {
  console.log('Requesting image description from server');

  const response = await fetch('/api/describe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: {
        base64: image.base64,
        mimeType: image.file.type
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
};

export const generateImage = async (
  params: GenerateParams,
): Promise<string[]> => {
  console.log('Requesting image generation from server with params:', params);

  // Map reference images to include mimeType if missing
  const processedReferenceImages = params.referenceImages?.map(img => ({
    base64: img.base64,
    mimeType: img.file.type
  }));

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      params: {
        ...params,
        referenceImages: processedReferenceImages
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates;
};

