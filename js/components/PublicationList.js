class PublicationList extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      // 只加载单个 JSON 文件
      const response = await fetch('/data/publications.json');
      const data = await response.json();
      
      // 直接使用数据中的顺序渲染
      this.render(data.publications);
    } catch (error) {
      console.error('Error loading publications:', error);
    }
  }

  render(publications) {
    const publicationsHTML = publications.map(pub => `
      <div class="publication-item">
        <div class="publication-thumbnail">
          <img src="${pub.thumbnail}" alt="${pub.title} thumbnail">
        </div>
        <div class="publication-info">
          <h3 class="publication-title">
            ${pub.title}
            <span class="publication-year">(${pub.year})</span>
          </h3>
          <p class="publication-authors">
            ${pub.authors.map(author => `<span class="author">${author}</span>`).join(', ')}
          </p>
          <p class="publication-venue">
            <span class="venue-name">${pub.venue.name}</span> |
            <span class="venue-type">${pub.venue.type}</span>
          </p>
          <div class="publication-footer">
            <div class="publication-links">
              <a href="${pub.links.pdf}" class="pub-link"><i class="fas fa-file-pdf"></i> PDF</a>
              ${pub.links.code ? `<a href="${pub.links.code}" class="pub-link"><i class="fas fa-code"></i> Code</a>` : ''}
              <a href="${pub.links.cite}" class="pub-link"><i class="fas fa-quote-right"></i> Cite</a>
            </div>
            <div class="publication-stats">
              <span class="stat-item">
                <i class="fas fa-quote-left"></i>
                <span>${pub.stats.citations} citations</span>
              </span>
              <span class="stat-item">
                <i class="fas fa-star"></i>
                <span>${pub.stats.stars} stars</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    this.innerHTML = `<div class="publications-list">${publicationsHTML}</div>`;
  }
}

customElements.define('publication-list', PublicationList);