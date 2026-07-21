'use client';

import { useState } from 'react';
import { EXAMPLE_CARDS_JSON } from '@/lib/example-cards';

export default function CopyExampleButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_CARDS_JSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard ใช้ไม่ได้ (เช่น ไม่ใช่ secure context) — ให้ user copy จาก textarea แทน
      window.prompt('Copy JSON ตัวอย่างจากช่องนี้:', EXAMPLE_CARDS_JSON);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="px-4 py-2 text-sm font-mono font-semibold text-slate-600 border border-slate-200
                 rounded-full hover:bg-slate-50 transition"
    >
      {copied ? '✓ copied!' : 'Copy example JSON'}
    </button>
  );
}
