class NewsList extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      const response = await fetch('/data/news.json');
      const data = await response.json();
      this.render(data.news);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  }

  render(news) {
    const getIcon = (text) => {
      if (text.includes('🔥')) return '<i class="fas fa-fire news-icon paper"></i>';
      if (text.includes('🎉')) return '<i class="fas fa-trophy news-icon success"></i>';
      if (text.includes('📖')) return '<i class="fas fa-book-open news-icon info"></i>';
      if (text.includes('🎤')) return '<i class="fas fa-microphone news-icon talk"></i>';
      return '<i class="fas fa-circle news-icon-dot"></i>';
    };

    const cleanText = (text) => {
      return text.replace(/[🔥🎉📖🎤]/g, '').trim();
    };

    const parseDate = (dateStr) => {
      const match = String(dateStr).trim().match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
      if (match) {
        return { month: match[1], year: match[2] };
      }
      return { month: dateStr, year: '' };
    };

    const renderContent = (content) => {
      const icon = getIcon(content.text);
      const text = cleanText(content.text);
      
      if (content.type === 'paper') {
        return `
          <div class="news-content-row">
            ${icon}
            <div class="news-text-wrapper">
              ${text}<a href="${content.link}" class="news-link">${content.title}</a> ${content.venue}
            </div>
          </div>
        `;
      }
      return `
        <div class="news-content-row">
          ${icon}
          <div class="news-text-wrapper">${text}</div>
        </div>
      `;
    };

    this.innerHTML = `
      <style>
        .news-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0.5rem 1.5rem 0.5rem 0;
          max-height: 600px;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        /* 自定义滚动条样式 */
        .news-list::-webkit-scrollbar {
          width: 4px;
        }

        .news-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .news-list::-webkit-scrollbar-thumb {
          background: var(--primary-color);
          border-radius: 10px;
          opacity: 0.2;
        }

        .news-item {
          display: flex;
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

        .news-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .news-content-row {
          display: flex;
          gap: 0.6rem;
          align-items: flex-start;
          line-height: 1.5;
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
          font-size: 0.95rem;
          color: var(--text-color);
          line-height: 1.6;
          transition: color 0.3s ease;
        }

        .news-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          margin: 0 0.3rem;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .news-link:hover {
          border-bottom-color: var(--primary-color);
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
        }
      </style>
      <div class="news-list">
        ${news.map(item => {
          const { month, year } = parseDate(item.date);
          return `
          <div class="news-item">
            <div class="news-date-wrapper">
              <div class="news-date">
                <span class="news-date-month">${month}</span>
                ${year ? `<span class="news-date-year">${year}</span>` : ''}
              </div>
            </div>
            <div class="news-content">
              ${item.content.map(content => renderContent(content)).join('')}
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }
}

customElements.define('news-list', NewsList);