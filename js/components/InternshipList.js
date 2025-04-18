class InternshipList extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      const response = await fetch('/data/internships.json');
      const data = await response.json();
      this.render(data.internships);
    } catch (error) {
      console.error('Error loading internships:', error);
    }
  }

  render(internships) {
    const internshipsHTML = internships.map(intern => `
      <div class="internship-item">
        <div class="company-logo">
          <img src="${intern.logo}" alt="${intern.company} Logo">
        </div>
        <div class="internship-info">
          <h3 class="company-name">${intern.company}</h3>
          <p class="position">${intern.position}</p>
          <div class="internship-meta">
            <p class="internship-period">
              <i class="far fa-calendar-alt"></i>
              <span>${intern.period}</span>
            </p>
            <p class="internship-location">
              <i class="fas fa-map-marker-alt"></i>
              <span>${intern.location}</span>
            </p>
            <p class="internship-location">
              <span>${intern.duties}</span>
            </p>
          </div>
        </div>
      </div>
    `).join('');

    this.innerHTML = `<div class="internship-list">${internshipsHTML}</div>`;
  }
}

customElements.define('internship-list', InternshipList);