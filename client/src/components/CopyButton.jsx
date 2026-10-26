import { useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { copyToClipboard } from '../utils/copyText.js';

export default function CopyButton({ text, label = 'Copy explanation' }) {
  const [status, setStatus] = useState('idle');
  const resetTimer = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
    },
    [],
  );

  async function handleCopy() {
    window.clearTimeout(resetTimer.current);
    setStatus('copying');
    try {
      const ok = await copyToClipboard(text);
      setStatus(ok ? 'copied' : 'error');
      resetTimer.current = window.setTimeout(() => setStatus('idle'), ok ? 2200 : 4000);
    } catch (error) {
      console.error('Could not copy explanation:', error);
      setStatus('error');
      resetTimer.current = window.setTimeout(() => setStatus('idle'), 4000);
    }
  }

  const statusLabel =
    status === 'copied'
      ? 'Copied!'
      : status === 'error'
        ? 'Copy failed — try again'
        : status === 'copying'
          ? 'Copying…'
          : label;

  return (
    <button
      type="button"
      className={`copy-btn ${status === 'copied' ? 'copied' : ''} ${status === 'error' ? 'copy-error' : ''}`}
      onClick={handleCopy}
      disabled={!text || status === 'copying'}
      aria-label={statusLabel}
      aria-live="polite"
    >
      {status === 'copied' ? (
        <Check size={16} aria-hidden />
      ) : status === 'error' ? (
        <X size={16} aria-hidden />
      ) : (
        <Copy size={16} aria-hidden />
      )}
      <span>{statusLabel}</span>
    </button>
  );
}
