import { GoogleGenAI } from '@google/genai';
import { buildPrompt } from './promptBuilder.js';
import { parseModelJson, normalizeResult } from '../utils/parseResponse.js';

const DEFAULT_MODEL = 'gemma-4-26b-a4b-it';
const GENERATION_TIMEOUT_MS = 90000;

function getConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = (process.env.GEMMA_MODEL?.trim() || DEFAULT_MODEL);
  return { apiKey, model };
}

function mapApiError(err) {
  const message = err?.message || String(err);
  const lower = message.toLowerCase();
  const status = err?.status || err?.code;

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return { status: 503, code: 'MISSING_API_KEY', message: 'Server is missing GEMINI_API_KEY. Copy server/.env.example to server/.env and add your key.' };
  }

  if (lower.includes('api key') || lower.includes('invalid') && lower.includes('key') || status === 401 || status === 403) {
    return { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid or unauthorized API key. Check GEMINI_API_KEY in server/.env.' };
  }

  if (lower.includes('not found') && lower.includes('model') || lower.includes('model') && lower.includes('unsupported') || status === 404) {
    return {
      status: 400,
      code: 'UNSUPPORTED_MODEL',
      message: `Model may be unavailable for your account. Set GEMMA_MODEL in server/.env (default: ${DEFAULT_MODEL}).`,
    };
  }

  if (lower.includes('quota') || lower.includes('rate') || status === 429) {
    return { status: 429, code: 'RATE_LIMIT', message: 'Rate limit or quota exceeded. Wait a moment and try again.' };
  }

  if (lower.includes('timeout') || lower.includes('timed out') || err?.name === 'AbortError') {
    return { status: 504, code: 'TIMEOUT', message: 'The model took too long to respond. Try again or use a shorter topic.' };
  }

  if (lower.includes('fetch failed') || lower.includes('network') || lower.includes('econnrefused')) {
    return { status: 502, code: 'NETWORK_ERROR', message: 'Could not reach the Gemini API. Check your network connection.' };
  }

  return { status: 502, code: 'API_ERROR', message: 'The AI service returned an error. Try again shortly.' };
}

export async function generateExplanation(params) {
  const { apiKey, model } = getConfig();

  if (!apiKey) {
    const err = new Error('Missing API key');
    err.mapped = mapApiError(err);
    throw err;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(params);

  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const err = new Error('Request timed out');
      err.name = 'AbortError';
      reject(err);
    }, GENERATION_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: params.simplify ? 0.85 : 0.7,
          maxOutputTokens: 4096,
        },
      }),
      timeoutPromise,
    ]);

    const text = response?.text;
    if (!text) {
      const err = new Error('No text in response');
      err.mapped = { status: 502, code: 'EMPTY_RESPONSE', message: 'Model returned an empty response. Try again.' };
      throw err;
    }

    const parsed = parseModelJson(text);
    if (!parsed.ok) {
      const err = new Error(parsed.error);
      err.mapped = {
        status: 502,
        code: 'MALFORMED_OUTPUT',
        message: 'Could not parse the model output as JSON. Try again or switch mode.',
      };
      throw err;
    }

    const result = normalizeResult(parsed.data, params.mode, params.simplify);
    return { model, result };
  } catch (err) {
    if (!err.mapped) {
      err.mapped = mapApiError(err);
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function getHealthInfo() {
  const { apiKey, model } = getConfig();
  return {
    ok: true,
    apiKeyConfigured: Boolean(apiKey),
    model: model || DEFAULT_MODEL,
  };
}
