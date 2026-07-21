'use client';

import { useRef, useState, useTransition } from 'react';
import { importCards } from '@/app/actions/topics';

interface ImportCardsFormProps {
  topicId: number;
}

export default function ImportCardsForm({ topicId }: ImportCardsFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawJson = textareaRef.current?.value.trim() ?? '';
    if (!rawJson) {
      setMessage({ ok: false, text: 'วาง JSON ก่อนกดเพิ่ม' });
      return;
    }
    startTransition(async () => {
      const result = await importCards(topicId, rawJson);
      if (result.ok) {
        setMessage({ ok: true, text: `เพิ่มแล้ว ${result.count} การ์ด ✓` });
        if (textareaRef.current) textareaRef.current.value = '';
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        rows={10}
        spellCheck={false}
        placeholder={`วาง JSON ที่นี่ เช่น\n[\n  {\n    "target_word": "Docker",\n    "forbidden_words": ["Container", "Image", "Deploy"],\n    "category": "DevOps",\n    "difficulty": "Easy"\n  }\n]`}
        className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-mono text-sm text-slate-900
                   placeholder:text-slate-300 focus:outline-none focus:border-blue-500 transition resize-y"
      />
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-sm flex-1 ${
            message ? (message.ok ? 'text-blue-600' : 'text-slate-500') : ''
          }`}
          role="status"
        >
          {message?.text}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-semibold shrink-0
                     hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-600/20
                     disabled:opacity-50"
        >
          {isPending ? 'กำลังเพิ่ม...' : 'เพิ่มการ์ดจาก JSON'}
        </button>
      </div>
    </form>
  );
}
