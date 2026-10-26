import ResultBody, { ResultFooter } from './ResultBody.jsx';
import { answerLengthLabel } from '../constants.js';
import CopyButton from './CopyButton.jsx';
import { buildCopyPayload } from '../utils/copyText.js';

export default function ResultPanel(props) {
  const { response } = props;
  if (!response?.success) return null;

  const r = response.result;
  const isSimplified = Boolean(r.simplified);

  return (
    <article className="result-doc" aria-live="polite">
      <header className="result-header">
        <div className="result-heading">
          <p className="meta-label">Generated explanation</p>
          <h2>{r.title || response.topic}</h2>
          <p className="result-meta">
            <span>{response.subject}</span>
            <span>{response.learningDepthLabel || response.learningDepth}</span>
            <span>{response.modeLabel || response.mode}</span>
            {response.mode === 'exam' && response.answerLength ? (
              <span>{answerLengthLabel(response.answerLength)}</span>
            ) : null}
            {isSimplified ? <span className="badge-simplified">Simpler take</span> : null}
          </p>
          <CopyButton text={buildCopyPayload(response)} />
        </div>
      </header>

      <ResultBody response={response} showCopy={false} />

      <ResultFooter {...props} />
    </article>
  );
}
