import { GoogleGenAI } from '@google/genai';
import { buildPrompt } from './promptBuilder.js';
import { parseModelJson, normalizeResult } from '../utils/parseResponse.js';

const DEFAULT_MODEL = 'gemma-4-26b-a4b-it';
const GENERATION_TIMEOUT_MS = 90000;
const MAX_OUTPUT_TOKENS = {
  'quick-refresher': 1200,
  foundational: 1800,
  intermediate: 2400,
  advanced: 3200,
  'in-depth': 4096,
};

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

async function generateParsedResponse(ai, model, prompt, config) {
  let response = await ai.models.generateContent({ model, contents: prompt, config });
  let parsed = parseModelJson(response?.text);

  if (!parsed.ok) {
    response = await ai.models.generateContent({
      model,
      contents: `${prompt}\n\nFormatting correction: your previous output was not valid JSON. Return the same answer again as one complete JSON object only. Escape quotes and newlines inside string values.`,
      config: { ...config, temperature: 0.2 },
    });
    parsed = parseModelJson(response?.text);
  }

  return { response, parsed };
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
    const { response, parsed } = await Promise.race([
      generateParsedResponse(ai, model, prompt, {
        temperature: params.simplify ? 0.85 : 0.7,
        maxOutputTokens:
          params.mode === 'exam' && params.answerLength === '10-mark'
            ? 4096
            : params.simplify
              ? 1800
              : MAX_OUTPUT_TOKENS[params.learningDepth] || MAX_OUTPUT_TOKENS.intermediate,
      }),
      timeoutPromise,
    ]);

    if (!response?.text) {
      const err = new Error('No text in response');
      err.mapped = { status: 502, code: 'EMPTY_RESPONSE', message: 'Model returned an empty response. Try again.' };
      throw err;
    }

    if (!parsed.ok) {
      console.error(`Model returned invalid JSON after retry: ${parsed.error}`);
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
