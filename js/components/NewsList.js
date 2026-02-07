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
    const renderContent = (content) => {
      if (content.type === 'paper') {
        return `${content.text}<a href="${content.link}" class="news-link">${content.title}</a> ${content.venue}`;
      }
      return content.text;
    };

    this.innerHTML = `
      <style>
        .news-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 0 0.5rem;
          max-height: 500px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* 自定义滚动条样式 - Webkit浏览器 (Chrome, Safari, Edge) */
        .news-list::-webkit-scrollbar {
          width: 6px;
        }

        .news-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .news-list::-webkit-scrollbar-thumb {
          background: #6c5ce7;
          border-radius: 3px;
        }

        .news-list::-webkit-scrollbar-thumb:hover {
          background: #5f4eeb;
        }

        /* Firefox 滚动条样式 */
        .news-list {
          scrollbar-width: thin;
          scrollbar-color: #6c5ce7 #f1f1f1;
        }

        .news-item:first-child {
          margin-top: 0;
        }

        .news-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 0;
          background: transparent;
          border-radius: 0;
          align-items: flex-start;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .news-item:last-child {
          border-bottom: none;
        }

        .news-date {
          flex: 0 0 85px;
          font-size: 0.9rem;
          color: #6c5ce7;
          font-weight: 500;
        }

        .news-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .news-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #2d3436;
          line-height: 1.4;
        }

        .news-link {
          color: #6c5ce7;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .news-link:hover {
          color: #5f4eeb;
        }

        @media (max-width: 768px) {
          .news-list {
            max-height: 400px;
            padding: 0.25rem 0.5rem;
            gap: 0.35rem;
          }

          .news-item {
            padding: 0.5rem;
            gap: 0.5rem;
          }

          .news-date {
            flex: 0 0 65px;
            font-size: 0.85rem;
          }

          .news-content p {
            font-size: 0.85rem;
          }
        }
      </style>
      <div class="news-list">
        ${news.map(item => `
          <div class="news-item">
            <div class="news-date">${item.date}</div>
            <div class="news-content">
              ${item.content.map(content => `<p>${renderContent(content)}</p>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('news-list', NewsList);