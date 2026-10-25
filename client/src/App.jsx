import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { explainTopic, fetchHealth } from './api.js';
import {
  MODES,
  SAMPLE_TOPICS,
  SUBJECTS,
  LEARNING_DEPTHS,
  ANSWER_LENGTHS,
  subjectCode,
} from './constants.js';
import ResultPanel from './components/ResultPanel.jsx';

export default function App() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [learningDepth, setLearningDepth] = useState('intermediate');
  const [mode, setMode] = useState('analogy');
  const [answerLength, setAnswerLength] = useState('5-mark');
  const [loading, setLoading] = useState(false);
  const [simplifyLoading, setSimplifyLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);
  const [simplifiedLayer, setSimplifiedLayer] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  const abortRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    fetchHealth()
      .then(setApiStatus)
      .catch(() => setApiStatus({ apiKeyConfigured: false }));
  }, []);

  const runExplain = useCallback(
    async (overrides = {}) => {
      const trimmed = (overrides.topic ?? topic).trim();
      const useSubject = overrides.subject ?? subject;
      const useMode = overrides.mode ?? mode;
      const useLearningDepth = overrides.learningDepth ?? learningDepth;
      const useAnswerLength = overrides.answerLength ?? answerLength;
      const simplify = Boolean(overrides.simplify);
      const previousExplanation = overrides.previousExplanation ?? '';

      if (!trimmed) {
        setError('Enter a topic to explain.');
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      if (simplify) {
        setSimplifyLoading(true);
      } else {
        setLoading(true);
        setResponse(null);
        setSimplifiedLayer(null);
      }
      setError('');

      const { ok, data } = await explainTopic(
        {
          topic: trimmed,
          subject: useSubject,
          learningDepth: useLearningDepth,
          mode: useMode,
          answerLength: useMode === 'exam' ? useAnswerLength : undefined,
          simplify,
          previousExplanation,
        },
        controller.signal,
      );

      if (controller.signal.aborted) return;

      if (simplify) {
        setSimplifyLoading(false);
      } else {
        setLoading(false);
      }

      if (!ok || !data.success) {
        if (data.code !== 'DUPLICATE_REQUEST') {
          setError(data.error || 'Could not generate an explanation.');
        }
        return;
      }

      if (simplify) {
        setSimplifiedLayer(data);
      } else {
        setResponse(data);
        requestAnimationFrame(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    },
    [topic, subject, mode, learningDepth, answerLength],
  );

  function handleSubmit(e) {
    e.preventDefault();
    runExplain();
  }

  function handleSample(sample) {
    setTopic(sample.topic);
    setSubject(sample.subject);
    setError('');
  }

  function handleReset() {
    if (abortRef.current) abortRef.current.abort();
    setTopic('');
    setSubject(SUBJECTS[0]);
    setLearningDepth('intermediate');
    setMode('analogy');
    setAnswerLength('5-mark');
    setLoading(false);
    setSimplifyLoading(false);
    setError('');
    setResponse(null);
    setSimplifiedLayer(null);
  }

  function handleSimplify() {
    if (!response?.result) return;
    const previousExplanation = [
      response.result.definition,
      response.result.analogy,
      response.result.scenario,
      response.result.explanation,
      response.result.diagramExplanation,
      response.result.examAnswer,
      response.result.example,
    ]
      .filter(Boolean)
      .join('\n\n');

    runExplain({
      simplify: true,
      previousExplanation,
      topic: response.topic,
      subject: response.subject,
      learningDepth: response.learningDepth,
      mode: response.mode,
      answerLength: response.answerLength || answerLength,
    });
  }

  function handleSwitchMode(nextMode) {
    setMode(nextMode);
    runExplain({
      mode: nextMode,
      topic: response?.topic || topic,
      subject: response?.subject || subject,
      learningDepth: response?.learningDepth || learningDepth,
      answerLength: response?.answerLength || answerLength,
    });
  }

  const modelLabel = apiStatus?.model?.includes('gemma') ? 'Gemma 4' : apiStatus?.model || 'Gemma 4';

  return (
    <div className="app-shell">
      <header className="masthead">
        <div className="masthead-meta">
          <div className="masthead-meta-inner">
            <span>Technical learning workspace</span>
            <span>Same concept · different perspective</span>
          </div>
        </div>
        <div className="masthead-inner">
          <div className="masthead-title">
            <h1>Explain It Sideways</h1>
            <div className="masthead-note">
              <p className="masthead-desc tagline-lead">
                Same concept. <em>Different perspective.</em>
              </p>
              <p className="masthead-desc">
                Understand engineering and computer science topics through analogies, diagrams, exam-style
                answers, and modes that match how you actually study.
              </p>
              <p className="masthead-steps">
                <b>01</b> subject & depth · <b>02</b> topic or sample · <b>03</b> explain, copy, simplify
              </p>
            </div>
          </div>
        </div>
        {apiStatus && !apiStatus.apiKeyConfigured ? (
          <p className="api-hint" role="status">
            API key not configured — add <code>GEMINI_API_KEY</code> to <code>server/.env</code> for live
            answers.
          </p>
        ) : null}
      </header>

      <main className="workspace">
        <div className="composer">
          <form className="composer-form" onSubmit={handleSubmit} noValidate>
            <div className="field topic-row">
              <label htmlFor="topic">Topic</label>
              <input
                id="topic"
                name="topic"
                type="text"
                className="topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What are you trying to understand?"
                maxLength={500}
                autoComplete="off"
                disabled={loading}
              />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  className="subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={loading}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="learningDepth">Learning depth</label>
                <select
                  id="learningDepth"
                  name="learningDepth"
                  className="subject-select"
                  value={learningDepth}
                  onChange={(e) => setLearningDepth(e.target.value)}
                  disabled={loading}
                >
                  {LEARNING_DEPTHS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="mode-fieldset">
              <legend>Explanation mode</legend>
              <div className="mode-grid">
                {MODES.map((m, idx) => (
                  <label key={m.id} className={`mode-option ${mode === m.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="mode"
                      value={m.id}
                      checked={mode === m.id}
                      onChange={() => setMode(m.id)}
                      disabled={loading}
                    />
                    <span className="mode-index">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="mode-text">
                      <span className="mode-label">{m.label}</span>
                      <span className="mode-hint">{m.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {mode === 'exam' ? (
              <fieldset className="exam-length-fieldset" aria-labelledby="exam-length-legend">
                <legend id="exam-length-legend">Exam answer length</legend>
                <div className="exam-length-row" role="radiogroup" aria-label="Exam answer length">
                  {ANSWER_LENGTHS.map((a) => (
                    <label key={a.id} className={`exam-length-option ${answerLength === a.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="answerLength"
                        value={a.id}
                        checked={answerLength === a.id}
                        onChange={() => setAnswerLength(a.id)}
                        disabled={loading}
                      />
                      {a.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading || simplifyLoading}>
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} aria-hidden /> Explain
                  </>
                )}
              </button>
              <button type="button" className="btn-ghost" onClick={handleReset} disabled={loading && !response}>
                <RotateCcw size={16} aria-hidden /> Reset
              </button>
            </div>

            <div className="samples">
              <p className="meta-label">Sample topics</p>
              <div className="sample-chips">
                {SAMPLE_TOPICS.map((s) => (
                  <button
                    key={s.topic}
                    type="button"
                    className="chip-btn"
                    onClick={() => handleSample(s)}
                    disabled={loading}
                  >
                    <span className="sample-code">{subjectCode(s.subject)}</span>
                    {s.topic}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="stage" ref={resultRef}>
          {error ? (
            <div className="stage-block">
              <div className="error-banner" role="alert">
                <div>
                  <p className="kicker">Could not generate</p>
                  <p className="error-text">{error}</p>
                </div>
                <button type="button" className="chip-btn" onClick={() => runExplain()} disabled={loading}>
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="loading-panel" aria-busy="true" aria-live="polite">
              <p className="loading-line">Generating your explanation…</p>
              <div className="loading-rule">
                <span aria-hidden />
              </div>
              <p className="loading-note">
                {MODES.find((m) => m.id === mode)?.label} · {LEARNING_DEPTHS.find((d) => d.id === learningDepth)?.label}
              </p>
            </div>
          ) : null}

          {!loading && !response && !error ? (
            <div className="empty-sheet">
              <h2 className="empty-title">Your explanation appears here</h2>
              <p className="empty-text">
                Choose a subject and depth, pick a mode, then enter a topic or select a sample to get started.
              </p>
              <div className="empty-rules" aria-hidden />
              <p className="empty-note">Markdown-friendly · copy · simplify · switch modes</p>
            </div>
          ) : null}

          {response ? (
            <ResultPanel
              response={response}
              simplifiedLayer={simplifiedLayer}
              onSimplify={handleSimplify}
              simplifyLoading={simplifyLoading}
              onSwitchMode={handleSwitchMode}
              activeMode={response.mode}
            />
          ) : null}

          {response ? (
            <p className="disclaimer">
              AI-generated answers can contain errors. Cross-check with your notes and course materials before
              exams.
            </p>
          ) : null}
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>Built for Hack Day · React + Vite + Express + {modelLabel}</p>
        </div>
      </footer>
    </div>
  );
}
