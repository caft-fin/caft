'use client';

import { useState } from 'react';
import { Eye, Edit3 } from 'lucide-react';
import { MarkdownBody } from '@/components/ui/MarkdownRenderer';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  required?: boolean;
}

const DEFAULT_PLACEHOLDER =
  `What will students learn in this course?

## Key Topics
- Topic 1
- Topic 2
- Topic 3

**Bold** and *italic* text are supported.
Use ## for section headings and - for bullet points.`;

// ── MarkdownEditor ────────────────────────────────────────────────────────────

export function MarkdownEditor({
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  rows = 9,
  label,
  required,
}: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div>
      {label && (
        <p className="text-sm font-semibold text-gray-600 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
      )}

      {/* Tab bar */}
      <div className="flex items-center bg-gray-50 border border-b-0 border-gray-200 rounded-t-xl px-2 pt-1.5 gap-1">
        {(['write', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-bold transition-all ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm border border-b-white border-gray-200 -mb-px pb-2'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
            }`}
          >
            {t === 'write'
              ? <Edit3 className="w-3 h-3" />
              : <Eye className="w-3 h-3" />
            }
            {t === 'write' ? 'Write' : 'Preview'}
          </button>
        ))}
        <span className="ml-auto pr-1 text-[10px] text-gray-400 font-medium tracking-wide pb-1">
          Markdown
        </span>
      </div>

      {/* Write pane */}
      {tab === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-white border border-gray-200 rounded-b-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-colors resize-y font-mono leading-relaxed text-gray-800 placeholder:text-gray-400 placeholder:font-sans placeholder:not-italic"
          style={{ minHeight: `${rows * 1.75}rem` }}
        />
      ) : (
        /* Preview pane */
        <div
          className="w-full bg-white border border-gray-200 rounded-b-xl px-5 py-4 text-sm text-gray-700 overflow-y-auto"
          style={{ minHeight: `${rows * 1.75}rem` }}
        >
          {value.trim() ? (
            <MarkdownBody text={value} className="text-gray-700" />
          ) : (
            <p className="text-gray-400 italic">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {/* Syntax hint */}
      <p className="mt-1.5 text-[10px] text-gray-400 font-mono leading-relaxed">
        # H1 &nbsp;·&nbsp; ## H2 &nbsp;·&nbsp; ### H3 &nbsp;·&nbsp;{' '}
        **bold** &nbsp;·&nbsp; *italic* &nbsp;·&nbsp; - list &nbsp;·&nbsp; `code`
      </p>
    </div>
  );
}
