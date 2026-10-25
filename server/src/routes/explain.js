import { Router } from 'express';
import { validateExplainRequest } from '../utils/validation.js';
import { generateExplanation } from '../services/gemmaService.js';
import { MODE_LABELS, LEARNING_DEPTH_LABELS } from '../utils/constants.js';

const router = Router();

const inFlight = new Map();

function requestKey({ topic, subject, mode, learningDepth, answerLength, simplify }) {
  return `${topic}|${subject}|${mode}|${learningDepth}|${answerLength || ''}|${simplify ? '1' : '0'}`;
}

router.post('/', async (req, res) => {
  const validation = validateExplainRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.errors.join(' '),
      code: 'VALIDATION_ERROR',
    });
  }

  const { topic, subject, mode, learningDepth, answerLength, simplify, previousExplanation } =
    validation.data;
  const key = requestKey({ topic, subject, mode, learningDepth, answerLength, simplify });

  if (inFlight.has(key)) {
    return res.status(409).json({
      success: false,
      error: 'A request for this topic and mode is already in progress.',
      code: 'DUPLICATE_REQUEST',
    });
  }

  const work = generateExplanation({
    topic,
    subject,
    mode,
    learningDepth,
    answerLength,
    simplify,
    previousExplanation,
  });

  inFlight.set(key, work);

  try {
    const { result } = await work;

    return res.json({
      success: true,
      topic,
      subject,
      mode,
      modeLabel: MODE_LABELS[mode],
      learningDepth,
      learningDepthLabel: LEARNING_DEPTH_LABELS[learningDepth],
      answerLength: mode === 'exam' ? answerLength : null,
      result,
    });
  } catch (err) {
    const mapped = err.mapped || { status: 500, code: 'UNKNOWN', message: 'Something went wrong.' };
    return res.status(mapped.status).json({
      success: false,
      error: mapped.message,
      code: mapped.code,
      topic,
      subject,
      mode,
    });
  } finally {
    inFlight.delete(key);
  }
});

export default router;
