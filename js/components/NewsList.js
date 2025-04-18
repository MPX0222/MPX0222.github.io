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
        return `${content.text}<a href="${content.link}">${content.title}</a> ${content.venue}`;
      }
      return content.text;
    };

    const newsHTML = news.map(item => `
      <div class="news-item">
        <div class="news-date">${item.date}</div>
        <div class="news-content">
          ${item.content.map(content => `<p>${renderContent(content)}</p>`).join('')}
        </div>
      </div>
    `).join('');

    this.innerHTML = `<div class="news-list">${newsHTML}</div>`;
  }
}

customElements.define('news-list', NewsList);