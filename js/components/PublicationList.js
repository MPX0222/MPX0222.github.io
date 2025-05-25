class PublicationList extends HTMLElement {
  constructor() {
    super();
    // 定义 venue 类型注册表
    this.venueRegistry = {
      'arXiv': { type: 'preprint', subtype: 'arXiv' },
      'NeurIPS': { type: 'conference', subtype: 'neurips' },
      'ICML': { type: 'conference', subtype: 'icml' },
      'ICLR': { type: 'conference', subtype: 'iclr' },
      'Frontiers': { type: 'journal', subtype: 'frontiers' },
      'Nature': { type: 'journal', subtype: 'nature' },
      'Science': { type: 'journal', subtype: 'science' }
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
    this.innerHTML = `
      <style>
        .publications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
        }

        .publication-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--card-bg);
          border-radius: 8px;
          align-items: flex-start;
        }

        .publication-thumbnail {
          flex: 0 0 240px;
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
        }

        .publication-thumbnail::before {
          content: "";
          display: block;
          padding-top: 66.67%;
        }

        .publication-thumbnail img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          padding: 0.5rem;
          background: #fff;
        }

        .publication-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .publication-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3436;
          margin: 0;
          line-height: 1.3;
        }

        .publication-year {
          color: #636e72;
          font-weight: normal;
          font-size: 0.9rem;
        }

        .publication-authors {
          font-size: 0.9rem;
          color: #2d3436;
          margin: 0;
          line-height: 1.4;
        }

        .author {
          color: #6c5ce7;
        }

        .publication-venue {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.25rem 0;
          flex-wrap: wrap;
        }

        .venue-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #fff;
        }

        .status-tag {
          font-size: 0.85rem;
          color: #666;
          padding: 0 0 0 0.6rem;
          font-weight: 400;
          position: relative;
        }

        .status-tag::before {
          content: "|";
          position: absolute;
          left: 0.2rem;
          color: #ddd;
        }

        .publication-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          gap: 0.75rem;
        }

        .publication-links {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pub-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.85rem;
          text-decoration: none;
          border-radius: 4px;
          background: #f8f9fa;
          color: #2d3436;
        }

        .pub-link i {
          font-size: 0.9rem;
        }

        .pub-link i.fa-file-pdf { color: #ff6b6b; }
        .pub-link i.fa-code { color: #6c5ce7; }
        .pub-link i.fa-quote-right { color: #20bf6b; }

        .publication-stats {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.85rem;
          color: #636e72;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: #f8f9fa;
        }

        .stat-item i {
          color: #6c5ce7;
          font-size: 0.9rem;
        }

        .github-stats {
          display: flex;
          align-items: center;
          padding: 0.15rem 0.3rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .github-stats img {
          height: 20px;
          width: auto;
        }

        @media (max-width: 1200px) {
          .publication-thumbnail {
            flex: 0 0 200px;
          }
        }

        @media (max-width: 768px) {
          .publications-list {
            padding: 0.75rem;
            gap: 0.5rem;
          }

          .publication-item {
            flex-direction: column;
            padding: 0.75rem;
            gap: 0.75rem;
          }

          .publication-thumbnail {
            width: 100%;
            flex: none;
          }

          .publication-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .publication-links,
          .publication-stats {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      </style>
      <div class="publications-list">
        ${publications.map(pub => {
          const venueInfo = this.getVenueType(pub.venue.name);
          return `
            <div class="publication-item">
              <div class="publication-thumbnail">
                <img src="${pub.thumbnail}" alt="${pub.title}">
              </div>
              <div class="publication-info">
                <h3 class="publication-title">
                  ${pub.title}
                  <span class="publication-year">(${pub.year})</span>
                </h3>
                <p class="publication-authors">
                  ${pub.authors.map(author => 
                    author === "Peixian Ma" ? 
                    `<strong class="author">${author}</strong>` : 
                    author
                  ).join(', ')}
                </p>
                <div class="publication-venue">
                  <span class="venue-tag ${venueInfo.type} ${venueInfo.subtype}">
                    ${pub.venue.name}
                  </span>
                  <span class="status-tag">${pub.venue.type}</span>
                </div>
                <div class="publication-footer">
                  <div class="publication-links">
                    ${pub.links.pdf ? `
                      <a href="${pub.links.pdf}" class="pub-link" target="_blank" rel="noopener">
                        <i class="fas fa-file-pdf"></i>
                        <span>PDF</span>
                      </a>
                    ` : ''}
                    ${pub.links.code ? `
                      <a href="${pub.links.code}" class="pub-link" target="_blank" rel="noopener">
                        <i class="fas fa-code"></i>
                        <span>Code</span>
                      </a>
                    ` : ''}
                    <button class="pub-link cite-button" data-bibtex="${pub.bibtex.replace(/"/g, '&quot;')}">
                      <i class="fas fa-quote-right"></i>
                      <span>Cite</span>
                    </button>
                  </div>
                  <div class="publication-stats">
                    <div class="stat-item">
                      <i class="fas fa-quote-left"></i>
                      <span>${pub.stats.citations} citations</span>
                    </div>
                    ${pub.links.github && pub.links.github.owner && pub.links.github.repo ? `
                      <div class="stat-item github-stats">
                        <img src="https://img.shields.io/github/stars/${pub.links.github.owner}/${pub.links.github.repo}?style=social" 
                             alt="GitHub stars">
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