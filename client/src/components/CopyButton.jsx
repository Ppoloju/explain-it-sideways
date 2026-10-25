import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/copyText.js';

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button type="button" className="copy-btn" onClick={handleCopy} disabled={!text}>
      {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}
