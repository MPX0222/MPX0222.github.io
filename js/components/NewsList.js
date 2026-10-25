class NewsList extends HTMLElement {
  constructor() {
    super();
    this.news = [];
    this.expanded = false;
    this.animating = false;
    this.previewCount = 8;
  }

  async connectedCallback() {
    try {
      const response = await fetch('/data/news.json');
      const data = await response.json();
      this.news = data.news || [];
      this.expanded = false;
      this.render(this.news);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  }

  render(news) {
    const getIcon = (text) => {
      if (text.includes('🔥')) return '<i class="fas fa-fire news-icon paper"></i>';
      if (text.includes('🎉')) return '<i class="fas fa-trophy news-icon success"></i>';
      if (text.includes('📖')) return '<i class="fas fa-book-open news-icon info"></i>';
      if (text.includes('💼')) return '<i class="fas fa-briefcase news-icon work"></i>';
      if (text.includes('🎤')) return '<i class="fas fa-microphone news-icon talk"></i>';
      return '<i class="fas fa-circle news-icon-dot"></i>';
    };

    const cleanText = (text) => {
      return text.replace(/[🔥🎉📖💼🎤]/g, '').replace(/^\s+/, '');
    };

    const newsImage = (item) => {
      if (!item || typeof item.image !== 'string') return '';
      return item.image.trim();
    };

    const escapeAttr = (value) => {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
    };

    const parseDate = (dateStr) => {
      const match = String(dateStr).trim().match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
      if (match) {
        return { month: match[1], year: match[2] };
      }
      return { month: dateStr, year: '' };
    };

    const renderContent = (content, item, index) => {
      const icon = getIcon(content.text);
      const text = cleanText(content.text);
      const imageSrc = newsImage(content) || (index === 0 && !item.content.some((entry) => newsImage(entry)) ? newsImage(item) : '');
      const imageAlt = content.title || item.date;
      const imageHtml = imageSrc
        ? `<div class="news-thumb"><img src="${escapeAttr(imageSrc)}" alt="${escapeAttr(imageAlt)}" loading="lazy"></div>`
        : '';
      const body = content.type === 'paper'
        ? `${text}<a href="${content.link}" class="news-link">${content.title}</a> ${content.venue}`
        : text;
      return `
        <div class="news-content-row">
          ${icon}
          <div class="news-text-wrapper">${body}</div>
          ${imageHtml}
        </div>
      `;
    };

    const recentNews = news.slice(0, this.previewCount);
    const earlierNews = news.slice(this.previewCount);
    const canToggle = earlierNews.length > 0;
    const showEarlier = this.expanded && canToggle;

    const renderItem = (item) => {
      const { month, year } = parseDate(item.date);
      return `
          <div class="news-item">
            <div class="news-date-wrapper">
              <div class="news-date">
                <span class="news-date-month">${month}</span>
                ${year ? `<span class="news-date-year">${year}</span>` : ''}
              </div>
            </div>
            <div class="news-main">
              <div class="news-content">
                ${item.content.map((content, index) => renderContent(content, item, index)).join('')}
              </div>
            </div>
          </div>
        `;
    };

    this.innerHTML = `
      <style>
        .news-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0.15rem 0 0;
        }

        .news-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          width: 100%;
          margin: 0.15rem 0 0;
          padding: 0.7rem 0 0.15rem;
          background: none;
          border: none;
          border-top: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-family: var(--font-sansation, 'Sansation', sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .news-more:hover {
          color: var(--primary-color);
        }

        .news-more i {
          font-size: 0.7rem;
        }

        .news-earlier {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .news-earlier.is-open {
          grid-template-rows: 1fr;
        }

        .news-earlier-clip {
          min-height: 0;
          overflow: hidden;
          clip-path: inset(0 100% 0 0);
          transition: clip-path 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .news-earlier.is-open .news-earlier-clip {
          clip-path: inset(0 0 0 0);
        }

        @media (prefers-reduced-motion: reduce) {
          .news-earlier,
          .news-earlier-clip {
            transition: none;
          }
        }

        .news-item {
          --news-text-size: 0.95rem;
          --news-text-leading: 1.6;
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          padding: 0.4rem 0; /* 极致压缩上下间距 */
          background: transparent;
          position: relative;
          z-index: 1;
          border-bottom: 1px solid var(--border-color);
          transition: border-color 0.3s ease;
        }

        .news-item:last-child {
          border-bottom: none;
        }

        .news-date-wrapper {
          flex: 0 0 52px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-top: 0.05rem;
        }

        .news-date {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.05rem;
          font-family: var(--font-sansation, 'Sansation', sans-serif);
          line-height: 1.15;
          transition: color 0.3s ease;
        }

        .news-date-month {
          font-size: 1.15rem;
          font-weight: 400;
          color: var(--text-color);
          letter-spacing: 0.02em;
          line-height: 1.1;
          transition: color 0.3s ease;
        }

        .news-date-year {
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          opacity: 0.8;
          transition: color 0.3s ease;
        }

        .news-item:hover .news-date-month {
          color: var(--primary-color);
        }

        .news-item:hover .news-date-year {
          color: var(--primary-color);
          opacity: 1;
        }

        .news-main {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: stretch;
          gap: 0.75rem;
        }

        .news-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .news-thumb {
          flex: 0 0 auto;
          align-self: stretch;
          position: relative;
          max-width: 42%;
          min-height: 0;
        }

        .news-thumb img {
          position: absolute;
          inset: 0;
          display: block;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          padding: 3px;
          border-radius: 4px;
          border: none;
          background: #ffffff;
        }

        :host-context([data-theme="dark"]) .news-thumb img,
        [data-theme="dark"] .news-thumb img {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .news-content-row {
          display: flex;
          gap: 0.6rem;
          align-items: flex-start;
          line-height: 1.5;
        }

        .news-content-row > .news-text-wrapper {
          flex: 1;
          min-width: 0;
        }

        .news-icon {
          font-size: 0.85rem;
          width: 18px;
          height: 1.5em; /* 严格匹配行高，消除额外空间 */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: transparent;
          z-index: 2;
        }

        .news-icon.paper { color: #ff7675; }
        .news-icon.success { color: #55efc4; }
        .news-icon.info { color: #74b9ff; }
        .news-icon.talk { color: #a29bfe; }
        .news-icon.work { color: #0984e3; }

        .news-icon-dot {
          font-size: 0.4rem;
          width: 18px;
          height: 1.5em; /* 严格匹配行高 */
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          opacity: 0.5;
        }

        .news-text-wrapper {
          font-size: 0.92rem;
          color: var(--text-color);
          line-height: 1.5;
          transition: color 0.3s ease;
        }

        .news-icon.paper { color: #ff7675; }
        .news-icon.success { color: #55efc4; }
        .news-icon.info { color: #74b9ff; }
        .news-icon.talk { color: #a29bfe; }
        .news-icon.work { color: #0984e3; }

        .news-icon-dot {
          font-size: 0.45rem;
          width: 20px;
          height: 1.6em;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          opacity: 0.5;
        }

        .news-text-wrapper {
          font-size: var(--news-text-size);
          color: var(--text-color);
          line-height: var(--news-text-leading);
          transition: color 0.3s ease;
        }

        a.news-link {
          color: var(--primary-color);
          text-decoration: underline;
          text-underline-offset: 0.15em;
          font-weight: 400;
          margin: 0;
          transition: color 0.2s ease;
        }

        a.news-link:hover {
          color: var(--primary-light);
        }

        @media (max-width: 768px) {
          .news-item {
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem 0;
          }

          .news-date-wrapper {
            flex: none;
            align-items: flex-start;
            flex-direction: row;
          }

          .news-date {
            flex-direction: row;
            align-items: baseline;
            gap: 0.35rem;
          }

          .news-date-month {
            font-size: 1rem;
          }

          .news-date-year {
            font-size: 0.75rem;
          }

          .news-content-row {
            gap: 0.75rem;
          }

          .news-main {
            width: 100%;
          }
        }
      </style>
      <div class="news-list">
        ${recentNews.map(item => renderItem(item)).join('')}
        ${showEarlier ? `
          <div class="news-earlier">
            <div class="news-earlier-clip">
              ${earlierNews.map(item => renderItem(item)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      ${canToggle ? `
        <button type="button" class="news-more" aria-expanded="${this.expanded ? 'true' : 'false'}">
          <span>${this.expanded ? 'Show recent' : 'Earlier news'}</span>
          <i class="fas fa-chevron-${this.expanded ? 'up' : 'down'}" aria-hidden="true"></i>
        </button>
      ` : ''}
    `;

    this.bindNewsImages();

    this.querySelector('.news-more')?.addEventListener('click', () => {
      if (this.animating) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!this.expanded) {
        this.animating = true;
        this.expanded = true;
        this.render(this.news);
        const earlier = this.querySelector('.news-earlier');
        if (!earlier || reduceMotion) {
          earlier?.classList.add('is-open');
          this.animating = false;
          return;
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            earlier.classList.add('is-open');
            this.finishDrawer(earlier, () => {
              this.animating = false;
            });
          });
        });
        return;
      }

      const earlier = this.querySelector('.news-earlier');
      if (!earlier || reduceMotion) {
        this.collapseNews();
        return;
      }
      this.animating = true;
      earlier.classList.remove('is-open');
      this.finishDrawer(earlier, () => this.collapseNews());
    });
  }

  bindNewsImages() {
    const fit = () => this.fitNewsImages();
    fit();
    this.querySelectorAll('.news-thumb img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', fit, { once: true });
    });
    if (!this.newsResize) {
      this.newsResize = new ResizeObserver(() => this.fitNewsImages());
    }
    this.newsResize.disconnect();
    const list = this.querySelector('.news-list');
    if (list) this.newsResize.observe(list);
  }

  fitNewsImages() {
    if (this.fittingImages) return;
    this.fittingImages = true;
    try {
      const thumbs = [...this.querySelectorAll('.news-thumb')];
      for (let pass = 0; pass < 4; pass += 1) {
        let changed = false;
        const widths = thumbs.map((thumb) => {
          const img = thumb.querySelector('img');
          const row = thumb.closest('.news-content-row');
          const text = row?.querySelector('.news-text-wrapper');
          const scope = row?.closest('.news-main') || row;
          if (!img || !text || !scope) return '0px';
          const height = text.getBoundingClientRect().height;
          const style = getComputedStyle(img);
          const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
          const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          const borderX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
          const borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
          const innerHeight = Math.max(height - padY - borderY, 0);
          const ratio = img.naturalWidth > 0 && img.naturalHeight > 0
            ? img.naturalWidth / img.naturalHeight
            : 2;
          const maxWidth = scope.getBoundingClientRect().width * 0.42;
          const width = Math.min(innerHeight * ratio + padX + borderX, Math.max(maxWidth, 0));
          return `${Math.round(width * 100) / 100}px`;
        });
        thumbs.forEach((thumb, index) => {
          if (thumb.style.width !== widths[index]) {
            thumb.style.width = widths[index];
            changed = true;
          }
        });
        if (!changed) break;
      }
    } finally {
      this.fittingImages = false;
    }
  }

  finishDrawer(earlier, done) {
    const clip = earlier.querySelector('.news-earlier-clip');
    let settled = false;
    const finish = (event) => {
      if (event && event.propertyName !== 'clip-path') return;
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clip?.removeEventListener('transitionend', finish);
      done();
    };
    const timer = setTimeout(() => finish(), 700);
    clip?.addEventListener('transitionend', finish);
  }

  collapseNews() {
    this.animating = false;
    this.expanded = false;
    this.render(this.news);
    this.closest('#news')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

customElements.define('news-list', NewsList);