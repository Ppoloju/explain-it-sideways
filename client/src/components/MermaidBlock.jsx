import { useEffect, useId, useState } from 'react';
import { Download, Minus, Plus, RotateCcw } from 'lucide-react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      background: '#fffdf9',
      primaryColor: '#e8f0e9',
      primaryTextColor: '#20382d',
      primaryBorderColor: '#47725c',
      lineColor: '#b56a45',
      secondaryColor: '#f6eee4',
      secondaryTextColor: '#3c352d',
      secondaryBorderColor: '#c59a74',
      tertiaryColor: '#f5f4ed',
      tertiaryTextColor: '#343831',
      tertiaryBorderColor: '#a7a99b',
      fontFamily: 'DM Sans, system-ui, sans-serif',
    },
    securityLevel: 'strict',
    fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
  });
  mermaidInitialized = true;
}

export default function MermaidBlock({ source }) {
  const id = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
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

  function downloadDiagram() {
    const diagram = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    const [, , width, height] = diagram.getAttribute('viewBox').split(/[,\s]+/).map(Number);
    diagram.setAttribute('width', String(Math.ceil(width)));
    diagram.setAttribute('height', String(Math.ceil(height)));
    diagram.style.background = '#fffdf9';
    const exportSvg = new XMLSerializer().serializeToString(diagram);
    const url = URL.createObjectURL(new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'concept-diagram.svg';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

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
    <div className="diagram-card">
      <div className="diagram-toolbar" aria-label="Diagram controls">
        <span className="diagram-caption">Concept map <span aria-hidden>·</span> {Math.round(zoom * 100)}%</span>
        <div className="diagram-controls">
          <button
            type="button"
            className="diagram-btn"
            aria-label="Zoom out"
            onClick={() => setZoom((value) => Math.max(0.6, Math.round((value - 0.2) * 10) / 10))}
            disabled={zoom <= 0.6}
          >
            <Minus size={15} aria-hidden />
          </button>
          <button
            type="button"
            className="diagram-btn"
            aria-label="Zoom in"
            onClick={() => setZoom((value) => Math.min(1.8, Math.round((value + 0.2) * 10) / 10))}
            disabled={zoom >= 1.8}
          >
            <Plus size={15} aria-hidden />
          </button>
          <button type="button" className="diagram-btn diagram-reset" onClick={() => setZoom(1)}>
            <RotateCcw size={14} aria-hidden /> Reset
          </button>
          <button type="button" className="diagram-btn diagram-download" onClick={downloadDiagram}>
            <Download size={14} aria-hidden /> Export SVG
          </button>
        </div>
      </div>
      <div className="mermaid-wrap">
        <div
          className="diagram-canvas"
          style={{ width: `${zoom * 100}%` }}
          dangerouslySetInnerHTML={{ __html: svg }}
          role="img"
          aria-label="Generated concept diagram"
        />
      </div>
    </div>
  );
}
