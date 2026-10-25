import {
  MODES,
  SUBJECTS,
  LEARNING_DEPTHS,
  ANSWER_LENGTHS,
  MAX_TOPIC_LENGTH,
  MAX_PREVIOUS_LENGTH,
} from './constants.js';

export function validateExplainRequest(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  if (!topic) {
    errors.push('Topic is required.');
  } else if (topic.length > MAX_TOPIC_LENGTH) {
    errors.push(`Topic must be at most ${MAX_TOPIC_LENGTH} characters.`);
  }

  const subject =
    typeof body.subject === 'string' && body.subject.trim()
      ? body.subject.trim()
      : 'Other';
  if (!SUBJECTS.includes(subject)) {
    errors.push('Invalid subject.');
  }

  const mode = typeof body.mode === 'string' ? body.mode.trim().toLowerCase() : '';
  if (!MODES.includes(mode)) {
    errors.push(`Mode must be one of: ${MODES.join(', ')}.`);
  }

  const learningDepthRaw =
    typeof body.learningDepth === 'string' ? body.learningDepth.trim().toLowerCase() : 'intermediate';
  const learningDepth = LEARNING_DEPTHS.includes(learningDepthRaw) ? learningDepthRaw : 'intermediate';

  let answerLength = null;
  if (mode === 'exam') {
    const raw =
      typeof body.answerLength === 'string' ? body.answerLength.trim().toLowerCase() : '5-mark';
    if (!ANSWER_LENGTHS.includes(raw)) {
      errors.push('Exam mode requires answerLength: 2-mark, 5-mark, or 10-mark.');
    } else {
      answerLength = raw;
    }
  }

  const simplify = Boolean(body.simplify);
  let previousExplanation = '';
  if (simplify) {
    previousExplanation =
      typeof body.previousExplanation === 'string' ? body.previousExplanation.trim() : '';
    if (!previousExplanation) {
      errors.push('Previous explanation is required when requesting a simpler explanation.');
    } else if (previousExplanation.length > MAX_PREVIOUS_LENGTH) {
      errors.push('Previous explanation is too long.');
    }
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: { topic, subject, mode, learningDepth, answerLength, simplify, previousExplanation },
  };
}
