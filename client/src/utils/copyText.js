export async function copyToClipboard(text) {
  if (!text) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    try {
      textarea.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

export function buildCopyPayload(response) {
  if (!response?.result) return '';
  const r = response.result;
  const lines = [`# ${r.title || response.topic}`, '', `**Topic:** ${response.topic}`];
  const details = [
    response.subject,
    response.learningDepthLabel || response.learningDepth,
    response.modeLabel || response.mode,
    response.answerLength ? `${response.answerLength} answer` : null,
  ].filter(Boolean);
  if (details.length) lines.push(`**Study notes:** ${details.join(' · ')}`);

  function addSection(title, content) {
    if (!content) return;
    lines.push('', `## ${title}`, '', content);
  }

  addSection('Definition', r.definition);
  addSection('Everyday analogy', r.analogy);
  if (r.mapping?.length) {
    lines.push('', '### Analogy mapping', '', '| In the analogy | In engineering |', '| --- | --- |');
    r.mapping.forEach((m) =>
      lines.push(`| ${markdownCell(m.analogyPart)} | ${markdownCell(m.technicalPart)} |`),
    );
  }
  addSection('Scenario', r.scenario);
  addSection('Technical meaning', r.technicalMeaning);
  addSection(
    'Explanation',
    r.explanation && r.explanation !== r.technicalMeaning && r.explanation !== r.diagramExplanation
      ? r.explanation
      : '',
  );
  if (r.mermaid) addSection('Diagram', `\`\`\`mermaid\n${r.mermaid}\n\`\`\``);
  addSection('Diagram walkthrough', r.diagramExplanation);
  addSection('Example', r.example);
  addSection('Common misconception', r.misconception);
  addSection('Exam answer', r.examAnswer);
  addSection('Memory trick', r.memoryTrick);
  addSection('Revision summary', r.revisionSummary);

  if (r.takeaways?.length) {
    lines.push('', '## Takeaways', '', ...r.takeaways.map((takeaway) => `- ${takeaway}`));
  }
  if (r.keywords?.length) addSection('Keywords', r.keywords.join(', '));

  return lines.join('\n').trim();
}

function markdownCell(value) {
  return value.replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
}
