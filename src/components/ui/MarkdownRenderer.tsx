'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ── Core markdown parser ──────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMarkdown(s: string): string {
  let r = escapeHtml(s);
  r = r.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 text-gray-800 rounded px-1 py-0.5 text-[0.85em] font-mono">$1</code>',
  );
  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  r = r.replace(/__(.+?)__/g, '<strong>$1</strong>');
  r = r.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  r = r.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
  return r;
}

export function renderMarkdown(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (/^### /.test(line)) {
      closeList();
      out.push(`<h3 class="text-base font-bold mt-5 mb-1.5">${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (/^## /.test(line)) {
      closeList();
      out.push(`<h2 class="text-lg font-bold mt-6 mb-2">${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (/^# /.test(line)) {
      closeList();
      out.push(`<h1 class="text-xl font-bold mt-6 mb-3">${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeList();
      out.push('<hr class="border-gray-200 my-4" />');
      continue;
    }

    const ulMatch = /^[-*] (.+)/.exec(line);
    if (ulMatch) {
      if (!inUl) {
        if (inOl) { out.push('</ol>'); inOl = false; }
        out.push('<ul class="list-disc pl-5 space-y-1 my-2">');
        inUl = true;
      }
      out.push(`<li class="leading-relaxed">${inlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = /^\d+\. (.+)/.exec(line);
    if (olMatch) {
      if (!inOl) {
        if (inUl) { out.push('</ul>'); inUl = false; }
        out.push('<ol class="list-decimal pl-5 space-y-1 my-2">');
        inOl = true;
      }
      out.push(`<li class="leading-relaxed">${inlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    if (line.trim() === '') {
      out.push('<div class="h-2"></div>');
      continue;
    }

    out.push(`<p class="leading-relaxed">${inlineMarkdown(line)}</p>`);
  }

  closeList();
  return out.join('\n');
}

export function hasMarkdown(text: string): boolean {
  return /(\*\*|__|\*|_|^#+ |^[-*] |^\d+\. |`|^---)/m.test(text);
}

/** Strip markdown syntax — for plain-text contexts like dark-background hero teasers */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── MarkdownBody ──────────────────────────────────────────────────────────────

export function MarkdownBody({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  if (hasMarkdown(text)) {
    return (
      <div
        className={`space-y-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
      />
    );
  }
  return (
    <p className={`whitespace-pre-line leading-relaxed ${className}`}>{text}</p>
  );
}

// ── DescriptionWithShowMore ───────────────────────────────────────────────────

export function DescriptionWithShowMore({
  text,
  className = '',
  previewChars = 240,
  buttonClassName = 'text-blue-400 hover:text-blue-300',
}: {
  text: string;
  className?: string;
  previewChars?: number;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > previewChars;
  const displayText =
    isLong && !expanded
      ? text.slice(0, previewChars).replace(/\s+\S*$/, '') + '…'
      : text;

  return (
    <div className={className}>
      <MarkdownBody text={displayText} />
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-2 inline-flex items-center gap-1 text-sm font-medium transition-colors ${buttonClassName}`}
        >
          {expanded
            ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
            : <><ChevronDown className="w-3.5 h-3.5" /> Show More</>
          }
        </button>
      )}
    </div>
  );
}
