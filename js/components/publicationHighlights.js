/**
 * 论文成就徽章（highlights）共享模块。
 * 数据来源：data/publications.json 中每篇论文的 highlights 数组。
 * 形态参考：AlphaXiv 论文页的成就徽章 —— 大圆角胶囊、浅色底、奖杯图标。
 *
 * 导出：
 *  - escapeHighlightHtml(value)          HTML 转义
 *  - HIGHLIGHT_PLATFORMS                 平台图标与品牌色注册表
 *  - renderPublicationHighlights(pub)    渲染一组徽章 HTML（空数据返回 ''）
 */

function escapeHighlightHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

/** 平台注册表：图标为官方 logo 的内联 SVG；brand 用于品牌色小圆点。 */
const HIGHLIGHT_PLATFORMS = {
  huggingface: {
    label: 'Hugging Face',
    brand: '#FF9D0B',
    svg: `<svg class="highlight-badge__platform-svg" viewBox="0 0 95 88" aria-hidden="true" focusable="false"><path fill="#FFD21E" d="M47.21 76.5a34.75 34.75 0 1 0 0-69.5 34.75 34.75 0 0 0 0 69.5Z"/><path fill="#FF9D0B" d="M81.96 41.75a34.75 34.75 0 1 0-69.5 0 34.75 34.75 0 0 0 69.5 0Zm-73.5 0a38.75 38.75 0 1 1 77.5 0 38.75 38.75 0 0 1-77.5 0Z"/><path fill="#3A3B45" d="M58.5 32.3c1.28.44 1.78 3.06 3.07 2.38a5 5 0 1 0-6.76-2.07c.61 1.15 2.55-.72 3.7-.32ZM34.95 32.3c-1.28.44-1.79 3.06-3.07 2.38a5 5 0 1 1 6.76-2.07c-.61 1.15-2.56-.72-3.7-.32Z"/><path fill="#FF323D" d="M46.96 56.29c9.83 0 13-8.76 13-13.26 0-2.34-1.57-1.6-4.09-.36-2.33 1.15-5.46 2.74-8.9 2.74-7.19 0-13-6.88-13-2.38s3.16 13.26 13 13.26Z"/><path fill="#3A3B45" fill-rule="evenodd" d="M39.43 54a8.7 8.7 0 0 1 5.3-4.49c.4-.12.81.57 1.24 1.28.4.68.82 1.37 1.24 1.37.45 0 .9-.68 1.33-1.35.45-.7.89-1.38 1.32-1.25a8.61 8.61 0 0 1 5 4.17c3.73-2.94 5.1-7.74 5.1-10.7 0-2.34-1.57-1.6-4.09-.36l-.14.07c-2.31 1.15-5.39 2.67-8.77 2.67s-6.45-1.52-8.77-2.67c-2.6-1.29-4.23-2.1-4.23.29 0 3.05 1.46 8.06 5.47 10.97Z" clip-rule="evenodd"/><path fill="#FF9D0B" d="M70.71 37a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM24.21 37a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM17.52 48c-1.62 0-3.06.66-4.07 1.87a5.97 5.97 0 0 0-1.33 3.76 7.1 7.1 0 0 0-1.94-.3c-1.55 0-2.95.59-3.94 1.66a5.8 5.8 0 0 0-.8 7 5.3 5.3 0 0 0-1.79 2.82c-.24.9-.48 2.8.8 4.74a5.22 5.22 0 0 0-.37 5.02c1.02 2.32 3.57 4.14 8.52 6.1 3.07 1.22 5.89 2 5.91 2.01a44.33 44.33 0 0 0 10.93 1.6c5.86 0 10.05-1.8 12.46-5.34 3.88-5.69 3.33-10.9-1.7-15.92-2.77-2.78-4.62-6.87-5-7.77-.78-2.66-2.84-5.62-6.25-5.62a5.7 5.7 0 0 0-4.6 2.46c-1-1.26-1.98-2.25-2.86-2.82A7.4 7.4 0 0 0 17.52 48Zm0 4c.51 0 1.14.22 1.82.65 2.14 1.36 6.25 8.43 7.76 11.18.5.92 1.37 1.31 2.14 1.31 1.55 0 2.75-1.53.15-3.48-3.92-2.93-2.55-7.72-.68-8.01.08-.02.17-.02.24-.02 1.7 0 2.45 2.93 2.45 2.93s2.2 5.52 5.98 9.3c3.77 3.77 3.97 6.8 1.22 10.83-1.88 2.75-5.47 3.58-9.16 3.58-3.81 0-7.73-.9-9.92-1.46-.11-.03-13.45-3.8-11.76-7 .28-.54.75-.76 1.34-.76 2.38 0 6.7 3.54 8.57 3.54.41 0 .7-.17.83-.6.79-2.85-12.06-4.05-10.98-8.17.2-.73.71-1.02 1.44-1.02 3.14 0 10.2 5.53 11.68 5.53.11 0 .2-.03.24-.1.74-1.2.33-2.04-4.9-5.2-5.21-3.16-8.88-5.06-6.8-7.33.24-.26.58-.38 1-.38 3.17 0 10.66 6.82 10.66 6.82s2.02 2.1 3.25 2.1c.28 0 .52-.1.68-.38.86-1.46-8.06-8.22-8.56-11.01-.34-1.9.24-2.85 1.31-2.85Z"/><path fill="#FFD21E" d="M38.6 76.69c2.75-4.04 2.55-7.07-1.22-10.84-3.78-3.77-5.98-9.3-5.98-9.3s-.82-3.2-2.69-2.9c-1.87.3-3.24 5.08.68 8.01 3.91 2.93-.78 4.92-2.29 2.17-1.5-2.75-5.62-9.82-7.76-11.18-2.13-1.35-3.63-.6-3.13 2.2.5 2.79 9.43 9.55 8.56 11-.87 1.47-3.93-1.71-3.93-1.71s-9.57-8.71-11.66-6.44c-2.08 2.27 1.59 4.17 6.8 7.33 5.23 3.16 5.64 4 4.9 5.2-.75 1.2-12.28-8.53-13.36-4.4-1.08 4.11 11.77 5.3 10.98 8.15-.8 2.85-9.06-5.38-10.74-2.18-1.7 3.21 11.65 6.98 11.76 7.01 4.3 1.12 15.25 3.49 19.08-2.12Z"/><path fill="#FF9D0B" d="M77.4 48c1.62 0 3.07.66 4.07 1.87a5.97 5.97 0 0 1 1.33 3.76 7.1 7.1 0 0 1 1.95-.3c1.55 0 2.95.59 3.94 1.66a5.8 5.8 0 0 1 .8 7 5.3 5.3 0 0 1 1.78 2.82c.24.9.48 2.8-.8 4.74a5.22 5.22 0 0 1 .37 5.02c-1.02 2.32-3.57 4.14-8.51 6.1-3.08 1.22-5.9 2-5.92 2.01a44.33 44.33 0 0 1-10.93 1.6c-5.86 0-10.05-1.8-12.46-5.34-3.88-5.69-3.33-10.9 1.7-15.92 2.78-2.78 4.63-6.87 5.01-7.77.78-2.66 2.83-5.62 6.24-5.62a5.7 5.7 0 0 1 4.6 2.46c1-1.26 1.98-2.25 2.87-2.82A7.4 7.4 0 0 1 77.4 48Zm0 4c-.51 0-1.13.22-1.82.65-2.13 1.36-6.25 8.43-7.76 11.18a2.43 2.43 0 0 1-2.14 1.31c-1.54 0-2.75-1.53-.14-3.48 3.91-2.93 2.54-7.72.67-8.01a1.54 1.54 0 0 0-.24-.02c-1.7 0-2.45 2.93-2.45 2.93s-2.2 5.52-5.97 9.3c-3.78 3.77-3.98 6.8-1.22 10.83 1.87 2.75 5.47 3.58 9.15 3.58 3.82 0 7.73-.9 9.93-1.46.1-.03 13.45-3.8 11.76-7-.29-.54-.75-.76-1.34-.76-2.38 0-6.71 3.54-8.57 3.54-.42 0-.71-.17-.83-.6-.8-2.85 12.05-4.05 10.97-8.17-.19-.73-.7-1.02-1.44-1.02-3.14 0-10.2 5.53-11.68 5.53-.1 0-.19-.03-.23-.1-.74-1.2-.34-2.04 4.88-5.2 5.23-3.16 8.9-5.06 6.8-7.33-.23-.26-.57-.38-.98-.38-3.18 0-10.67 6.82-10.67 6.82s-2.02 2.1-3.24 2.1a.74.74 0 0 1-.68-.38c-.87-1.46 8.05-8.22 8.55-11.01.34-1.9-.24-2.85-1.31-2.85Z"/><path fill="#FFD21E" d="M56.33 76.69c-2.75-4.04-2.56-7.07 1.22-10.84 3.77-3.77 5.97-9.3 5.97-9.3s.82-3.2 2.7-2.9c1.86.3 3.23 5.08-.68 8.01-3.92 2.93.78 4.92 2.28 2.17 1.51-2.75 5.63-9.82 7.76-11.18 2.13-1.35 3.64-.6 3.13 2.2-.5 2.79-9.42 9.55-8.55 11 .86 1.47 3.92-1.71 3.92-1.71s9.58-8.71 11.66-6.44c2.08 2.27-1.58 4.17-6.8 7.33-5.23 3.16-5.63 4-4.9 5.2.75 1.2 12.28-8.53 13.36-4.4 1.08 4.11-11.76 5.3-10.97 8.15.8 2.85 9.05-5.38 10.74-2.18 1.69 3.21-11.65 6.98-11.76 7.01-4.31 1.12-15.26 3.49-19.08-2.12Z"/></svg>`
  },
  alphaxiv: {
    label: 'alphaXiv',
    brand: '#9A2036',
    svg: `<svg class="highlight-badge__platform-svg" viewBox="0 0 718.41 504.47" aria-hidden="true" focusable="false"><polygon fill="currentColor" points="591.15 258.54 718.41 385.73 663.72 440.28 536.57 313.62 591.15 258.54"/><path fill="currentColor" d="M273.86.3c34.56-2.41,67.66,9.73,92.51,33.54l94.64,94.63-55.11,54.55-96.76-96.55c-16.02-12.7-37.67-12.1-53.19,1.11L54.62,288.82,0,234.23,204.76,29.57C223.12,13.31,249.27,2.02,273.86.3Z"/><path fill="currentColor" d="M663.79,1.29l54.62,54.58-418.11,417.9c-114.43,95.94-263.57-53.49-167.05-167.52l160.46-160.33,54.62,54.58-157.88,157.77c-33.17,40.32,18.93,91.41,58.66,57.48L663.79,1.29Z"/></svg>`
  }
};

/** 平台键名归一化，兼容 "alphaXiv" / "AlphaXiv" / "hugging_face" 等写法。 */
function normalizeHighlightPlatform(platform) {
  const key = String(platform || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'alphaxiv') return 'alphaxiv';
  if (key === 'huggingface' || key === 'hf') return 'huggingface';
  return '';
}

/**
 * 渲染一篇论文的成就徽章组；没有 highlights 时返回空字符串。
 * 每个徽章：大圆角胶囊 + 平台 logo + 文案，整块可点击；与会议信息同行展示。
 */
function renderPublicationHighlights(pub) {
  const items = Array.isArray(pub && pub.highlights) ? pub.highlights : [];
  if (!items.length) return '';

  const badges = items.map((item) => {
    const platformKey = normalizeHighlightPlatform(item.platform);
    const platform = HIGHLIGHT_PLATFORMS[platformKey];
    const text = escapeHighlightHtml(String(item.text || '').trim());
    const url = escapeHighlightHtml(String(item.url || '').trim());

    const platformIcon = platform
      ? `<span class="highlight-badge__platform" title="${escapeHighlightHtml(platform.label)}"${platform.brand ? ` style="color:${platform.brand}"` : ''}>${platform.svg}</span>`
      : '';
    const titleAttr = url ? ` title="${escapeHighlightHtml(platform ? `${platform.label}: ${item.text || ''}` : (item.text || ''))}"` : '';

    return `<a class="highlight-badge${platformKey ? ` highlight-badge--${platformKey}` : ''}" href="${url}" target="_blank" rel="noopener noreferrer"${titleAttr}>${platformIcon}<span>${text}</span></a>`;
  });

  return `<span class="publication-highlights">${badges.join('')}</span>`;
}

/** 徽章样式：自带 <style> 包裹，作为独立元素同时注入首页与 pub 页两个组件。
 *  选择器统一挂在 .publication-highlights 作用域下（特异性 0,2,0），
 *  以便在首页 light DOM 中稳定压过 .card-content a 的链接配色（0,1,1）。 */
const HIGHLIGHT_STYLES = `
        <style>
        .publication-highlights {
          display: inline-flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.375rem;
          margin: 0;
        }

        .publication-highlights .highlight-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.1875rem 0.625rem;
          border-radius: 999px;
          background-color: #fef3c7;
          color: #b45309;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.45;
          text-decoration: none;
          white-space: nowrap;
          font-family: var(--font-sansation, 'Sansation', sans-serif);
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .publication-highlights .highlight-badge:hover {
          background-color: #fde68a;
          color: #92400e;
          transform: translateY(-1px);
        }

        .publication-highlights .highlight-badge .highlight-badge__platform {
          display: inline-flex;
          align-items: center;
        }

        .publication-highlights .highlight-badge .highlight-badge__platform-svg {
          width: 0.875rem;
          height: 0.875rem;
          flex: none;
        }

        .publication-highlights .highlight-badge--alphaxiv .highlight-badge__platform-svg,
        .publication-highlights .highlight-badge--alphaxiv[style] .highlight-badge__platform-svg {
          color: #9A2036;
        }

        :host-context([data-theme="dark"]) .publication-highlights .highlight-badge {
          background-color: rgba(251, 191, 36, 0.14);
          color: #fcd34d;
        }

        :host-context([data-theme="dark"]) .publication-highlights .highlight-badge:hover {
          background-color: rgba(251, 191, 36, 0.24);
          color: #fde68a;
        }

        [data-theme="dark"] .publication-highlights .highlight-badge {
          background-color: rgba(251, 191, 36, 0.14);
          color: #fcd34d;
        }

        [data-theme="dark"] .publication-highlights .highlight-badge:hover {
          background-color: rgba(251, 191, 36, 0.24);
          color: #fde68a;
        }
        </style>
`;
