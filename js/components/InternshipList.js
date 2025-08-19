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
        <div class="internship-header">
          <div class="company-logo">
            <img src="${intern.logo}" alt="${intern.company} Logo">
          </div>
          <div class="internship-title">
            <h3 class="company-name">${intern.company}</h3>
            <p class="position">${intern.position}</p>
          </div>
          <div class="internship-period">
            <i class="far fa-calendar-alt"></i>
            <span>${intern.period}</span>
          </div>
        </div>
        <div class="internship-details">
          <div class="internship-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${intern.location}</span>
          </div>
          <div class="internship-duties">
            <i class="fas fa-tasks"></i>
            <span>${intern.duties}</span>
          </div>
        </div>
      </div>
    `).join('');

    this.innerHTML = `<div class="internship-list">${internshipsHTML}</div>`;
  }
}

customElements.define('internship-list', InternshipList);