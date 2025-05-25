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
          gap: 0.5rem;
          padding: 0.75rem 1.25rem 0.75rem 0.75rem;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        /* 隐藏 Webkit 浏览器的默认滚动条 */
        .news-list::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }

        /* 默认隐藏滚动条 */
        .news-list::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }

        /* 鼠标悬停在容器上时显示滚动条 */
        .news-list:hover::-webkit-scrollbar-thumb {
          background: rgba(108, 92, 231, 0.2);
        }

        /* 鼠标悬停在滚动条上时的样式 */
        .news-list:hover::-webkit-scrollbar-thumb:hover {
          background: rgba(108, 92, 231, 0.4);
        }

        .news-item:first-child {
          margin-top: 0;
        }

        .news-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--card-bg);
          border-radius: 6px;
          align-items: flex-start;
        }

        .news-date {
          flex: 0 0 70px;
          font-size: 0.9rem;
          color: #2d3436;
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
            padding: 0.5rem 1rem 0.5rem 0.5rem;
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