'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';

interface PageSection {
  title: string;
  content: string;
}

interface PageData {
  badge?: string;
  title: string;
  subtitle?: string;
  sections: PageSection[];
}

/**
 * Renders a page whose content is stored in AdminSettings under key `page_{slug}`.
 * Falls back to `fallback` content if no admin-configured content exists.
 */
export function DynamicPage({ slug, fallback }: { slug: string; fallback: PageData }) {
  const [page, setPage] = useState<PageData>(fallback);

  useEffect(() => {
    api.public.settings().then(res => {
      const raw = res.data[`page_${slug}`];
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PageData;
          if (parsed.title && parsed.sections?.length) setPage(parsed);
        } catch { /* use fallback */ }
      }
    }).catch(() => {});
  }, [slug]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        {page.badge && (
          <span className="inline-block py-1 px-4 rounded-full bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-widest mb-4">
            {page.badge}
          </span>
        )}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{page.title}</h1>
        {page.subtitle && <p className="text-gray-500">{page.subtitle}</p>}
      </div>
      <div className="prose prose-gray max-w-none space-y-8">
        {page.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
