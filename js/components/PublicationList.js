class PublicationList extends HTMLElement {
  constructor() {
    super();
    // 定义 venue 类型注册表
    this.venueRegistry = {
      'arXiv': { type: 'preprint', subtype: 'arXiv' },
      'NeurIPS': { type: 'conference', subtype: 'neurips' },
      'ICML': { type: 'conference', subtype: 'icml' },
      'ICLR': { type: 'conference', subtype: 'iclr' },
      'TKDE': { type: 'journal', subtype: 'tkde' },
      'BIBM': { type: 'conference', subtype: 'bibm' },
      'CPAL': { type: 'conference', subtype: 'cpal' },
      'Frontiers in Neuroscience': { type: 'journal', subtype: 'frontiers' },
      'Nature': { type: 'journal', subtype: 'nature' },
      'Science': { type: 'journal', subtype: 'science' },
      'ICME': { type: 'conference', subtype: 'icme' }
    };
    
    // 创建提示框元素
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'copy-tooltip';
    document.body.appendChild(this.tooltip);
  }

  // 显示提示框
  showTooltip(text, x, y) {
    this.tooltip.textContent = text;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y - 40}px`;
    this.tooltip.classList.add('show');
    setTimeout(() => {
      this.tooltip.classList.remove('show');
    }, 2000);
  }

  // 复制文本到剪贴板
  async copyToClipboard(text, button, event) {
    try {
      await navigator.clipboard.writeText(text);
      button.classList.add('cite-success');
      this.showTooltip('已复制引用到剪贴板！', event.clientX, event.clientY);
      setTimeout(() => {
        button.classList.remove('cite-success');
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
      this.showTooltip('复制失败，请重试', event.clientX, event.clientY);
    }
  }

  getVenueType(venueName) {
    // 通过 venue 名称获取对应的类型信息
    for (const [key, value] of Object.entries(this.venueRegistry)) {
      if (venueName.includes(key)) {
        return value;
      }
    }
    return { type: 'preprint', subtype: 'default' }; // 默认类型
  }

  /** 各会议 / 期刊的简约线性图标（非官方商标，仅作视觉识别） */
  getVenueIconSvg(subtype) {
    const stroke = 'stroke="currentColor"';
    const icons = {
      neurips: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="12" r="2.5"/><circle cx="17" cy="8" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9.5 12h4.5M14.5 10l2.5-1.5M14.5 14l2.5 1.5"/></svg>`,
      icml: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3L4 7l8 4 8-4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></svg>`,
      iclr: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h6"/></svg>`,
      tkde: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/><path d="M4 19c0 1.66 3.58 3 8 3s8-1.34 8-3"/><path d="M4 5v14"/></svg>`,
      bibm: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c2 3 4 5 4 9s-2 6-4 9c-2-3-4-5-4-9s2-6 4-9z"/><path d="M12 3c-2 3-4 5-4 9s2 6 4 9c2-3 4-5 4-9s-2-6-4-9z"/></svg>`,
      cpal: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
      frontiers: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12c2-4 5-6 9-6s7 2 9 6c-2 4-5 6-9 6s-7-2-9-6z"/><circle cx="12" cy="12" r="2"/></svg>`,
      nature: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3C8 8 6 13 8 18c2-2 4-3 4-3s2 1 4 3c2-5 0-10-4-15z"/><path d="M12 10c-1 3-1 6 0 8"/></svg>`,
      science: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4"/><path d="M12 3v18"/></svg>`,
      icme: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M7 5V3M17 5V3M10 19v2M14 19v2"/><circle cx="12" cy="12" r="3"/></svg>`,
      arXiv: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>`,
      default: `<svg class="venue-badge__svg" viewBox="0 0 24 24" fill="none" ${stroke} stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21V12h6v9"/></svg>`
    };
    return icons[subtype] || icons.default;
  }

  async connectedCallback() {
    try {
      const response = await fetch('/data/publications.json');
      const data = await response.json();
      this.render(data.publications);
    } catch (error) {
      console.error('Error loading publications:', error);
      this.innerHTML = '<p>Error loading publications</p>';
    }
  }

  render(publications) {
    // 过滤只显示 showInHome 为 true 的论文
    const featuredPublications = publications.filter(pub => pub.showInHome !== false);

    this.innerHTML = `
      <style>
        .publications-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0;
        }

        .publication-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem 0;
          background: transparent;
          border-radius: 0;
          align-items: flex-start;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .publication-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .publication-thumbnail {
          flex: 0 0 180px;
          height: 110px;
          border-radius: 6px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .publication-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
        }

        .publication-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 0;
        }

        .publication-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .publication-title {
          font-size: 1.25rem;
          font-weight: 500;
          color: #111827;
          margin: 0;
          line-height: 1.3;
          font-family: var(--font-family);
        }

        .publication-year {
          color: #6b7280;
          font-weight: 500;
          font-size: 1rem;
          font-family: var(--font-family);
        }

        .publication-authors {
          font-size: 0.9rem;
          color: #374151;
          margin: 0;
          line-height: 1.4;
          font-family: var(--font-family);
        }

        .author {
          color: #6366f1;
          font-weight: 600;
        }

        .publication-venue {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          flex-wrap: wrap;
        }

        .venue-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.1875rem 0.375rem;
          border-radius: 3px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.025em;
          font-family: var(--font-family);
        }

        /* 简洁的venue颜色方案 */
        .venue-tag.preprint.arXiv { 
          background-color: #fef2f2;
          color: #dc2626;
        }
        
        .venue-tag.conference { 
          background-color: #f0fdf4;
          color: #16a34a;
        }
        
        .venue-tag.journal { 
          background-color: #eff6ff;
          color: #2563eb;
        }

        .status-tag {
          font-size: 0.6875rem;
          color:rgb(126, 126, 126);
          padding: 0.1875rem 0.375rem;
          background-color:rgb(255, 255, 255);
          border-radius: 3px;
          font-weight: 500;
          font-family: var(--font-family);
        }

        .publication-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: -0.5rem;
        }

        .publication-left {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .publication-venue {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          flex-wrap: wrap;
        }

        .publication-links {
          display: flex;
          gap: 0.1rem;
          flex-wrap: wrap;
          align-items: center;
          margin: 0.5rem;
        }

        button.pub-link {
          background: none !important;
          border: none !important;

          font-family: inherit !important;
          cursor: pointer !important;
        }

        .publication-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          font-family: var(--font-family);
        }

        .stat-item i {
          color: #6366f1;
          font-size: 0.6875rem;
        }

        .github-stats {
          display: inline-flex;
          align-items: center;
        }

        .github-stats img {
          height: 14px;
          width: auto;
        }

        /* 响应式设计 */
        @media (max-width: 1024px) {
          .publication-thumbnail {
            flex: 0 0 120px;
            height: 80px;
          }
          
          .publication-item {
            gap: 0.875rem;
            padding: 0.875rem;
          }
        }

        @media (max-width: 768px) {
          .publications-list {
            gap: 1.25rem;
          }

          .publication-item {
            flex-direction: column;
            padding: 1.25rem 0;
            gap: 0.75rem;
          }

          .publication-thumbnail {
            width: 100%;
            height: 100px;
            flex: none;
          }

          .publication-title {
            font-size: 1.125rem;
          }

          .publication-authors {
            font-size: 0.875rem;
          }

          .publication-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.375rem;
            margin-top: 0;
          }

          .publication-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            width: 100%;
          }

          .publication-left,
          .publication-stats {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .publication-item {
            padding: 1rem 0;
          }

          .publication-thumbnail {
            height: 90px;
          }

          .publication-title {
            font-size: 1rem;
          }

          .venue-tag {
            font-size: 0.625rem;
            padding: 0.125rem 0.25rem;
          }

          .pub-link, .stat-item {
            font-size: 0.6875rem;
            padding: 0.1875rem 0.375rem;
          }
        }

        /* 简洁的复制提示框 */
        .copy-tooltip {
          position: fixed;
          background-color: #111827;
          color: white;
          padding: 0.25rem 0.375rem;
          border-radius: 3px;
          font-size: 0.6875rem;
          font-weight: 500;
          pointer-events: none;
          opacity: 0;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .copy-tooltip.show {
          opacity: 1;
        }
      </style>
      <div class="publications-list">
        ${featuredPublications.map(pub => {
          const venueInfo = this.getVenueType(pub.venue.name);
          return `
            <div class="publication-item">
              <div class="publication-thumbnail">
                <img src="${pub.thumbnail}" alt="${pub.title}" loading="lazy">
              </div>
              <div class="publication-info">
                <div class="publication-header">
                  <h3 class="publication-title">
                    ${pub.title}
                    <span class="publication-year">(${pub.year})</span>
                  </h3>
                  <p class="publication-authors">
                    ${pub.authors.map(author => 
                      author === "Peixian Ma" || author === "Peixian Ma*" ? 
                      `<span class="author">${author}</span>` : 
                      author
                    ).join(', ')}
                  </p>
                </div>
                <div class="publication-footer">
                  <div class="publication-left">
                    <div class="publication-venue">
                      <span class="venue-tag ${venueInfo.type} ${venueInfo.subtype}">
                        ${pub.venue.name}
                      </span>
                      <span class="status-tag">${pub.venue.type}</span>
                    </div>
                    <div class="publication-links">
                      ${pub.links.pdf ? `
                        <a href="${pub.links.pdf}" class="pub-link pdf-link" target="_blank" rel="noopener">
                          <i class="fas fa-file-pdf"></i>
                          <span>Paper</span>
                        </a>
                      ` : ''}
                      ${pub.links.code ? `
                        <a href="${pub.links.code}" class="pub-link code-link" target="_blank" rel="noopener">
                          <i class="fab fa-github"></i>
                          <span>Code</span>
                        </a>
                      ` : ''}
                      <button class="pub-link cite-button cite-link" data-bibtex="${pub.bibtex.replace(/"/g, '&quot;')}" aria-label="Copy BibTeX citation">
                        <i class="fa-brands fa-google"></i>
                        <span>Bibtex</span>
                      </button>
                    </div>
                  </div>
                  <div class="publication-stats">
                    <div class="stat-item">
                      <i class="fa-solid fa-hashtag"></i>
                      <span>${pub.stats.citations} citations</span>
                    </div>
                    ${pub.links.github && pub.links.github.owner && pub.links.github.repo ? `
                      <div class="stat-item github-stats">
                        <img src="https://img.shields.io/github/stars/${pub.links.github.owner}/${pub.links.github.repo}?style=social" 
                             alt="GitHub stars" loading="lazy">
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // 添加点击事件监听器
    this.querySelectorAll('.cite-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const bibtex = button.dataset.bibtex;
        this.copyToClipboard(bibtex, button, event);
      });
    });
  }
}

customElements.define('publication-list', PublicationList);