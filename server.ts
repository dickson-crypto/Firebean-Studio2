import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload size for base64 images
app.use(express.json({ limit: '50mb' }));

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
      const isOverloaded = 
        error?.status === 503 || 
        error?.code === 503 ||
        error?.status === 429 ||
        error?.code === 429 ||
        (typeof error?.message === 'string' && (error.message.includes('overloaded') || error.message.includes('503')));

      if (isOverloaded && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Gemini API overloaded (Attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// API Routes
app.post('/api/describe', async (req, res) => {
  try {
    const { image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = "Describe this image in high detail for image generation purposes. Include subject, setting, artistic style, lighting, colors, and camera angle. Output only the description.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.base64,
              mimeType: image.mimeType || 'image/png'
            }
          },
          { text: prompt }
        ]
      }
    });

    return res.json({ text: response.text || "Failed to generate description." });
  } catch (error: any) {
    console.error('Server description error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { params } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [];
    
    if (params.referenceImages && params.referenceImages.length > 0) {
      for (const img of params.referenceImages) {
        parts.push({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType || 'image/png',
          },
        });
      }
    } 
    
    parts.push({ text: params.prompt });

    const isLiteModel = params.imageModel === 'gemini-2.5-flash-image';
    const imageConfig: any = {
      aspectRatio: "1:1"
    };
    
    if (!isLiteModel) {
      imageConfig.imageSize = "1K";
    }

    // Generate 3 candidates
    const generatePromises = [1, 2, 3].map(() => 
      retryOperation(() => ai.models.generateContent({
        model: params.imageModel,
        contents: {
          parts: parts,
        },
        config: {
          imageConfig
        }
      }))
    );

    const responses = await Promise.all(generatePromises);
    const candidates: string[] = [];

    for (const response of responses) {
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          if (!base64Data) continue;
          
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${base64Data}`;
          candidates.push(imageUrl);
          break; 
        }
      }
    }

    if (candidates.length > 0) {
      return res.json({ candidates });
    }
    
    throw new Error('No images found in response.');
  } catch (error: any) {
    console.error('Server generation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    // Handle SPA fallback
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
