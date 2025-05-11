class PublicationList extends HTMLElement {
  constructor() {
    super();
    // 定义 venue 类型注册表
    this.venueRegistry = {
      'Arxiv': { type: 'preprint', subtype: 'arxiv' },
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