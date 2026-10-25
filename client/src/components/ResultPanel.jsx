import ResultBody, { ResultFooter } from './ResultBody.jsx';
import { answerLengthLabel } from '../constants.js';

export default function ResultPanel(props) {
  const { response } = props;
  if (!response?.success) return null;

  const r = response.result;
  const isSimplified = Boolean(r.simplified);

  return (
    <article className="result-doc" aria-live="polite">
      <header className="result-header">
        <div>
          <p className="meta-label">Generated explanation</p>
          <h2>{r.title || response.topic}</h2>
          <p className="result-meta">
            <span>{response.subject}</span>
            <span className="meta-sep" aria-hidden>
              ·
            </span>
            <span>{response.learningDepthLabel || response.learningDepth}</span>
            <span className="meta-sep" aria-hidden>
              ·
            </span>
            <span>{response.modeLabel || response.mode}</span>
            {response.mode === 'exam' && response.answerLength ? (
              <>
                <span className="meta-sep" aria-hidden>
                  ·
                </span>
                <span>{answerLengthLabel(response.answerLength)}</span>
              </>
            ) : null}
            {isSimplified ? (
              <>
                <span className="meta-sep" aria-hidden>
                  ·
                </span>
                <span className="badge-simplified">Simpler take</span>
              </>
            ) : null}
          </p>
        </div>
      </header>

      <ResultBody response={response} />

      <ResultFooter {...props} />
    </article>
  );
}
