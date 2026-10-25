import MermaidBlock from './MermaidBlock.jsx';
import CopyButton from './CopyButton.jsx';
import { buildCopyPayload, buildExamCopy } from '../utils/copyText.js';
import { MODES, answerLengthLabel } from '../constants.js';

function Section({ title, children, className = '' }) {
  if (!children) return null;
  return (
    <section className={`result-section ${className}`}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

function MappingTable({ mapping }) {
  if (!mapping?.length) return null;
  return (
    <table className="mapping-table">
      <thead>
        <tr>
          <th scope="col">In the analogy</th>
          <th scope="col">In engineering</th>
        </tr>
      </thead>
      <tbody>
        {mapping.map((row, i) => (
          <tr key={`${row.analogyPart}-${i}`}>
            <td>{row.analogyPart}</td>
            <td>{row.technicalPart}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ResultBody({ response, showCopy = true }) {
  if (!response?.success) return null;

  const r = response.result;
  const fullCopy = buildCopyPayload(response);
  const examCopy = buildExamCopy(response);

  return (
    <>
      {showCopy ? (
        <div className="result-actions inline-actions">
          <CopyButton text={fullCopy} label="Copy explanation" />
          {response.mode === 'exam' && r.examAnswer ? (
            <CopyButton text={examCopy} label="Copy exam answer" />
          ) : null}
        </div>
      ) : null}

      {r.definition ? (
        <Section title="Definition">
          <p className="prose">{r.definition}</p>
        </Section>
      ) : null}

      {response.mode === 'analogy' && r.analogy ? (
        <Section title="Everyday analogy" className="accent-analogy">
          <p className="prose lead">{r.analogy}</p>
          <MappingTable mapping={r.mapping} />
        </Section>
      ) : null}

      {response.mode === 'meme' && r.scenario ? (
        <Section title="The scenario" className="accent-meme">
          <p className="prose lead">{r.scenario}</p>
          {r.technicalMeaning ? (
            <>
              <h4>What it really means</h4>
              <p className="prose">{r.technicalMeaning}</p>
            </>
          ) : null}
        </Section>
      ) : null}

      {response.mode === 'visual' && (r.mermaid || r.diagramExplanation) ? (
        <Section title={r.mermaid ? 'Diagram' : 'Visual explanation'}>
          {r.mermaid ? <MermaidBlock source={r.mermaid} /> : null}
          {r.diagramExplanation ? <p className="prose">{r.diagramExplanation}</p> : null}
        </Section>
      ) : null}

      {r.explanation && response.mode !== 'exam' ? (
        <Section title={response.mode === 'visual' ? 'How to read it' : 'Technical explanation'}>
          <p className="prose">{r.explanation}</p>
        </Section>
      ) : null}

      {r.example ? (
        <Section title="Example">
          <p className="prose">{r.example}</p>
        </Section>
      ) : null}

      {r.misconception ? (
        <Section title="Common misconception">
          <p className="prose">{r.misconception}</p>
        </Section>
      ) : null}

      {response.mode === 'exam' && r.examAnswer ? (
        <Section title={answerLengthLabel(response.answerLength) || 'Exam answer'}>
          <div className="exam-answer prose">{r.examAnswer}</div>
        </Section>
      ) : null}

      {r.keywords?.length ? (
        <Section title="Keywords">
          <ul className="keyword-list">
            {r.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {r.takeaways?.length ? (
        <Section title="Takeaways">
          <ul className="prose-list">
            {r.takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {r.memoryTrick ? (
        <div className="memory-trick" role="note">
          <p className="meta-label">Memory trick</p>
          <p>{r.memoryTrick}</p>
        </div>
      ) : null}

      {r.revisionSummary ? (
        <Section title="Revision summary">
          <p className="prose">{r.revisionSummary}</p>
        </Section>
      ) : null}
    </>
  );
}

export function ResultFooter({ response, simplifiedLayer, onSimplify, simplifyLoading, onSwitchMode, activeMode }) {
  const isSimplified = Boolean(response?.result?.simplified);

  if (simplifiedLayer?.success) {
    const sr = simplifiedLayer.result;
    return (
      <div className="simplified-layer">
        <p className="meta-label">Still not clicking? Here&apos;s a simpler pass</p>
        <h3>{sr.title || simplifiedLayer.topic}</h3>
        <ResultBody response={simplifiedLayer} showCopy />
      </div>
    );
  }

  return (
    <footer className="result-footer">
      {!isSimplified && onSimplify ? (
        <button type="button" className="btn-simplify" onClick={onSimplify} disabled={simplifyLoading}>
          {simplifyLoading ? (
            <>
              <span className="spinner" aria-hidden /> Simplifying…
            </>
          ) : (
            'Still confused? Explain it simpler'
          )}
        </button>
      ) : null}

      <div className="mode-switch">
        <span className="meta-label">Switch mode</span>
        <div className="mode-switch-row">
          {MODES.filter((m) => m.id !== activeMode).map((m) => (
            <button key={m.id} type="button" className="chip-btn" onClick={() => onSwitchMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
