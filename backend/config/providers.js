import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { CohereClientV2 } from 'cohere-ai';
import dotenv from 'dotenv';
dotenv.config();

// ─── Initialize Clients ────────────────────────────────────────

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const cohereClient = new CohereClientV2({ token: process.env.COHERE_API_KEY });

// ─── Retry Helper ───────────────────────────────────────────────

const withRetry = async (fn, retries = 3, delayMs = 1500) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.status || err.statusCode;
      const retryable = status === 503 || status === 429 || status === 500;
      if (retryable && attempt < retries) {
        const wait = delayMs * (attempt + 1);
        console.warn(`  ↻ Retry ${attempt + 1}/${retries} after ${wait}ms (status ${status})`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
};

// ─── Gemini Provider ────────────────────────────────────────────

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
const GEMINI_IMAGE_MODELS = [
  process.env.GEMINI_IMAGE_MODEL,
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
].filter(Boolean);

export async function geminiGenerate(prompt, systemInstruction = '') {
  const contents = [{ role: 'user', parts: [{ text: prompt }] }];

  let lastErr;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await withRetry(() =>
        geminiClient.models.generateContent({
          model,
          contents,
          config: systemInstruction ? { systemInstruction } : undefined,
        })
      );
      return response.text;
    } catch (err) {
      console.warn(`  Gemini ${model} failed (${err.status}), trying next…`);
      lastErr = err;
    }
  }
  throw lastErr;
}

export async function geminiGenerateImage(prompt) {
  let lastErr;

  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const response = await withRetry(() =>
        geminiClient.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        })
      );

      const parts = response?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(part => part.inlineData?.data);

      if (imagePart?.inlineData?.data) {
        return {
          mimeType: imagePart.inlineData.mimeType || 'image/png',
          data: imagePart.inlineData.data,
          model,
        };
      }
    } catch (err) {
      console.warn(`  Gemini image ${model} failed (${err.status || err.message}), trying next…`);
      lastErr = err;
    }
  }

  throw lastErr || new Error('Gemini did not return image data');
}

// ─── Groq Provider (Llama 3.3 70B) ─────────────────────────────

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

export async function groqGenerate(prompt, systemInstruction = '') {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  let lastErr;
  for (const model of GROQ_MODELS) {
    try {
      const response = await withRetry(() =>
        groqClient.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        })
      );
      return response.choices[0].message.content;
    } catch (err) {
      console.warn(`  Groq ${model} failed, trying next…`);
      lastErr = err;
    }
  }
  throw lastErr;
}

// ─── Cohere Provider (Command R+) ───────────────────────────────

const COHERE_MODELS = ['command-r-plus-08-2024', 'command-r-08-2024'];

export async function cohereGenerate(prompt, systemInstruction = '') {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  let lastErr;
  for (const model of COHERE_MODELS) {
    try {
      const response = await withRetry(() =>
        cohereClient.chat({
          model,
          messages,
          temperature: 0.7,
          maxTokens: 4096,
        })
      );
      return response.message.content[0].text;
    } catch (err) {
      console.warn(`  Cohere ${model} failed, trying next…`);
      lastErr = err;
    }
  }
  throw lastErr;
}

// ─── Unified Provider Map ───────────────────────────────────────

export const providers = {
  gemini: geminiGenerate,
  groq: groqGenerate,
  cohere: cohereGenerate,
};
