import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'strict',
    fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
  });
  mermaidInitialized = true;
}

export default function MermaidBlock({ source }) {
  const id = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!source?.trim()) {
      setSvg('');
      setError('No diagram was generated.');
      return;
    }

    let cancelled = false;

    async function render() {
      initMermaid();
      try {
        await mermaid.parse(source);
        const { svg: rendered } = await mermaid.render(`mmd-${id}`, source);
        if (!cancelled) {
          setSvg(rendered);
          setError('');
        }
      } catch (e) {
        if (!cancelled) {
          setSvg('');
          setError(e.message || 'Could not render diagram.');
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [source, id]);

  if (error) {
    return (
      <div className="mermaid-fallback">
        <p className="meta-label">Diagram could not be rendered</p>
        <p className="fallback-msg">{error}</p>
        <pre className="mermaid-source">{source}</pre>
      </div>
    );
  }

  return (
    <div
      className="mermaid-wrap"
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="Concept diagram"
    />
  );
}
