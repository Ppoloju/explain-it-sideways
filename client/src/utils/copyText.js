export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function buildCopyPayload(response) {
  if (!response?.result) return '';
  const r = response.result;
  const lines = [
    response.topic,
    [
      response.subject,
      response.learningDepthLabel || response.learningDepth,
      response.modeLabel || response.mode,
      response.answerLength ? response.answerLength : null,
    ]
      .filter(Boolean)
      .join(' · '),
    '',
  ];

  if (r.definition) lines.push(`Definition: ${r.definition}`, '');
  if (r.analogy) lines.push(`Analogy: ${r.analogy}`, '');
  if (r.mapping?.length) {
    lines.push('Mapping:');
    r.mapping.forEach((m) => lines.push(`  • ${m.analogyPart} → ${m.technicalPart}`));
    lines.push('');
  }
  if (r.scenario) lines.push(`Scenario: ${r.scenario}`, '');
  if (r.technicalMeaning) lines.push(`Technical meaning: ${r.technicalMeaning}`, '');
  if (r.explanation) lines.push(`Explanation: ${r.explanation}`, '');
  if (r.diagramExplanation) lines.push(`Diagram: ${r.diagramExplanation}`, '');
  if (r.example) lines.push(`Example: ${r.example}`, '');
  if (r.misconception) lines.push(`Misconception: ${r.misconception}`, '');
  if (r.examAnswer) lines.push(`Exam answer:\n${r.examAnswer}`, '');
  if (r.memoryTrick) lines.push(`Memory trick: ${r.memoryTrick}`, '');
  if (r.revisionSummary) lines.push(`Revision: ${r.revisionSummary}`, '');
  if (r.takeaways?.length) {
    lines.push('Takeaways:');
    r.takeaways.forEach((t) => lines.push(`  • ${t}`));
  }
  if (r.keywords?.length) lines.push(`Keywords: ${r.keywords.join(', ')}`);

  return lines.join('\n').trim();
}

export function buildExamCopy(response) {
  const r = response?.result;
  if (!r?.examAnswer) return buildCopyPayload(response);
  return [
    response.topic,
    response.subject,
    '',
    r.definition ? `Definition: ${r.definition}\n` : '',
    r.examAnswer,
    '',
    r.keywords?.length ? `Keywords: ${r.keywords.join(', ')}` : '',
    r.revisionSummary ? `\nRevision: ${r.revisionSummary}` : '',
  ]
    .filter((x) => x !== '')
    .join('\n')
    .trim();
}
