import { MODE_LABELS, LEARNING_DEPTH_LABELS } from '../utils/constants.js';

const JSON_RULES = `
Respond with ONLY valid JSON (no markdown fences, no commentary before or after).
Use double quotes for all keys and string values.
Escape newlines inside strings as \\n where needed.
Do not include trailing commas.
`;

const DEPTH_INSTRUCTIONS = {
  'quick-refresher': `Learning depth: Quick Refresher — focus on the essential idea and one concise example; skip unnecessary background but keep critical caveats. Aim for 100-150 words total.`,
  foundational: `Learning depth: Foundational — establish only the necessary prerequisites and core terminology; explain the concept with one concrete example. Aim for 180-260 words total.`,
  intermediate: `Learning depth: Intermediate — explain how and why it works with technical terms, one example, and practical implications. Aim for 250-350 words total.`,
  advanced: `Learning depth: Advanced — prioritize mechanisms, important edge cases, trade-offs, and relevant technical detail. Keep the notes structured and concise.`,
  'in-depth': `Learning depth: In-Depth / Research-Oriented — cover assumptions, limitations, alternatives, and advanced implications in concise sections; distinguish established facts from uncertainty and avoid repetition.`,
};

const EXAM_LENGTH_INSTRUCTIONS = {
  '2-mark': `Exam format: 2-mark answer — concise definition or direct answer; essential technical fact or distinction; short formula or example only when useful. Keep it brief.`,
  '5-mark': `Exam format: 5-mark answer — definition or context, core explanation and key points, relevant example/steps/formula/diagram note; appropriate detail without padding.`,
  '10-mark': `Exam format: 10-mark answer — structured comprehensive answer with mechanisms, classifications, steps, or derivations as relevant; examples, complexity or trade-offs when applicable; concise conclusion. Adapt sections to the topic.`,
};

function baseContext(topic, subject, mode, learningDepth) {
  const depthLine = DEPTH_INSTRUCTIONS[learningDepth] || DEPTH_INSTRUCTIONS.intermediate;
  const networkAccuracy = subject === 'Computer Networks'
    ? `For networking topics, distinguish protocol guarantees from typical performance. Do not claim a protocol always has higher throughput or lower latency. Separate error detection (such as checksums) from delivery guarantees and retransmission; UDP itself does not guarantee delivery or retransmit lost data.`
    : '';
  return `You are an expert technical tutor helping college students with engineering and computer science concepts.
Topic: "${topic}"
Subject area: ${subject}
Explanation style: ${MODE_LABELS[mode] || mode}
${depthLine}
Be accurate, clear, and respect the student's intelligence. Do not oversimplify advanced topics unless depth is foundational or quick-refresher.
Write scan-friendly study notes: keep each field focused, avoid repeating the definition in the explanation, and omit optional details that do not clarify this topic. For Exam Mode, follow the selected mark length instead of the general word targets.
${networkAccuracy}
${JSON_RULES}`;
}

export function buildPrompt({
  topic,
  subject,
  mode,
  learningDepth = 'intermediate',
  answerLength = '5-mark',
  simplify,
  previousExplanation,
}) {
  if (simplify) {
    return `${baseContext(topic, subject, mode, learningDepth)}

The student is still confused. Explain MORE SIMPLY in plain language, using a short, focused answer.
Use simpler wording and explain difficult steps explicitly.
Use a DIFFERENT analogy or metaphor than before when an analogy helps.
Keep essential technical accuracy and relevant terminology.
Do NOT repeat the previous explanation verbatim.

Previous explanation to simplify (not copy):
"""
${previousExplanation}
"""

Return JSON with this shape:
{
  "title": "short heading",
  "definition": "one or two simple sentences",
  "explanation": "plain-language walkthrough",
  "analogy": "new everyday analogy if helpful",
  "mapping": [{"analogyPart": "...", "technicalPart": "..."}],
  "example": "one tiny example",
  "takeaways": ["point 1", "point 2"],
  "memoryTrick": "one line",
  "revisionSummary": "2-3 sentence recap"
}`;
  }

  switch (mode) {
    case 'analogy':
      return `${baseContext(topic, subject, mode, learningDepth)}

Generate an EVERYDAY ANALOGY explanation.
Use a relatable analogy to build intuition, then explicitly connect it back to the actual technical mechanism.
Do not let the analogy replace the correct definition or imply a technically inaccurate equivalence.
For advanced or in-depth topics, keep a full technical explanation after the analogy.

Return JSON:
{
  "title": "Understanding ...",
  "definition": "correct technical definition",
  "analogy": "relatable scenario (2-4 sentences)",
  "mapping": [
    {"analogyPart": "element in the story", "technicalPart": "technical counterpart"}
  ],
  "explanation": "technical explanation connecting back to the analogy",
  "example": "one concrete example",
  "misconception": "one common misconception and correction",
  "takeaways": ["2-4 short bullets"]
}`;

    case 'meme':
      return `${baseContext(topic, subject, mode, learningDepth)}

Generate MEME MODE: concise, relevant humor that technical students appreciate.
Keep the underlying explanation correct and useful.
Avoid unrelated jokes, excessive slang, or emoji-heavy content.

Return JSON:
{
  "title": "catchy short title",
  "scenario": "humorous student/dev scenario (3-5 sentences)",
  "technicalMeaning": "what the scenario teaches technically",
  "takeaways": ["exactly three memorable bullets"],
  "memoryTrick": "one-line memory trick",
  "definition": "one-sentence definition"
}`;

    case 'visual':
      return `${baseContext(topic, subject, mode, learningDepth)}

Generate VISUAL THINKING: use a Mermaid diagram when it genuinely helps.
If a formula, table, or short worked example fits better than a diagram, set "mermaid" to empty string and put that structure in "diagramExplanation" instead.

Mermaid rules when used:
- Use flowchart TD or LR with simple node IDs (letters/numbers, no spaces in IDs).
- Labels in quotes inside brackets, e.g. A["Process A"].
- No HTML tags, no click handlers, no javascript.
- Keep 4-10 nodes max.

Return JSON:
{
  "title": "diagram title",
  "definition": "brief definition",
  "mermaid": "valid mermaid source or empty string if not used",
  "diagramExplanation": "walkthrough of nodes/relationships or alternative structure",
  "example": "short example tied to the visual",
  "takeaways": ["2-3 bullets"]
}`;

    case 'exam': {
      const examLine = EXAM_LENGTH_INSTRUCTIONS[answerLength] || EXAM_LENGTH_INSTRUCTIONS['5-mark'];
      return `${baseContext(topic, subject, mode, learningDepth)}

Generate EXAM MODE: ${examLine}
Do not guarantee any examination score or claim a specific university marking scheme.

Return JSON:
{
  "title": "topic title for exam",
  "definition": "formal definition",
  "examAnswer": "full structured answer appropriate for the selected mark format",
  "keywords": ["important term 1", "term 2"],
  "revisionSummary": "short revision block",
  "example": "worked or illustrative example if applicable"
}`;
    }

    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }
}

export function learningDepthLabel(id) {
  return LEARNING_DEPTH_LABELS[id] || id;
}
