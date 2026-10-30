'use client';

import React from 'react';

export function parseArticleHtml(content: string): string {
  if (!content) return '';

  let html = content;

  // 1. Convert markdown link [text](url) to styled blue link
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|tel:[^\s)]+|mailto:[^\s)]+|\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-semibold">$1</a>'
  );

  // 2. Convert markdown bold **text** to <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 3. Convert markdown italic *text* to <em>
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // 4. Ensure any manual <a ...> tags without class get the bright blue link styling
  html = html.replace(/<a(?!\s+class=)([^>]+)>/gi, '<a class="text-blue-600 hover:text-blue-800 underline font-semibold" target="_blank" rel="noopener noreferrer"$1>');

  // 5. Preserve line breaks
  const lines = html.split('\n');
  return lines.join('<br />');
}

interface ArticleBodyRendererProps {
  content: string;
  className?: string;
}

export default function ArticleBodyRenderer({ content, className = '' }: ArticleBodyRendererProps) {
  const html = parseArticleHtml(content);

  return (
    <div 
      className={`article-content leading-relaxed text-base text-gray-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
