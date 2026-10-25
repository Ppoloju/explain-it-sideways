/**
 * Extract and parse JSON from model text output.
 */
export function parseModelJson(text) {
  if (!text || typeof text !== 'string') {
    return { ok: false, error: 'Empty model response.' };
  }

  let cleaned = text.trim();

  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else {
    const inlineFence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (inlineFence) {
      cleaned = inlineFence[1].trim();
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return { ok: false, error: 'Model did not return JSON object.', raw: text.slice(0, 500) };
  }

  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Parsed JSON is not an object.' };
    }
    return { ok: true, data: parsed };
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${e.message}`, raw: cleaned.slice(0, 500) };
  }
}

export function normalizeResult(raw, mode, simplify) {
  const title =
    typeof raw.title === 'string' && raw.title.trim()
      ? raw.title.trim()
      : 'Explanation';

  const result = {
    title,
    definition: stringOrEmpty(raw.definition),
    explanation: stringOrEmpty(raw.explanation),
    analogy: stringOrEmpty(raw.analogy),
    mapping: normalizeMapping(raw.mapping),
    example: stringOrEmpty(raw.example),
    misconception: stringOrEmpty(raw.misconception),
    takeaways: normalizeStringArray(raw.takeaways),
    scenario: stringOrEmpty(raw.scenario),
    technicalMeaning: stringOrEmpty(raw.technicalMeaning),
    memoryTrick: stringOrEmpty(raw.memoryTrick),
    mermaid: stringOrEmpty(raw.mermaid),
    diagramExplanation: stringOrEmpty(raw.diagramExplanation),
    examAnswer: stringOrEmpty(raw.examAnswer),
    keywords: normalizeStringArray(raw.keywords),
    revisionSummary: stringOrEmpty(raw.revisionSummary),
    simplified: simplify,
  };

  if (mode === 'meme' && !result.explanation) {
    result.explanation = result.technicalMeaning;
  }
  if (mode === 'visual' && !result.explanation) {
    result.explanation = result.diagramExplanation;
  }

  return result;
}

function stringOrEmpty(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function normalizeStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim());
}

function normalizeMapping(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const analogyPart = stringOrEmpty(item.analogyPart ?? item.analogy);
      const technicalPart = stringOrEmpty(item.technicalPart ?? item.technical);
      if (!analogyPart && !technicalPart) return null;
      return { analogyPart, technicalPart };
    })
    .filter(Boolean);
}
