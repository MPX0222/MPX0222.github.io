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
    const isCompact = this.getAttribute('mode') === 'compact';

    if (isCompact) {
        const internshipsHTML = internships.map(intern => `
            <div class="compact-list-item">
                <div class="compact-logo">
                    <img src="${intern.logo}" alt="${intern.company} Logo">
                </div>
                <div class="compact-details">
                    <div class="compact-header">
                        <span class="compact-title">${intern.company}</span>
                        <span class="compact-date">${intern.period}</span>
                    </div>
                    <div class="compact-subtitle">${intern.position}</div>
                    ${intern.duties ? `<div class="compact-desc">${intern.duties}</div>` : ''}
                </div>
            </div>
        `).join('');
        this.innerHTML = `<div class="internship-list compact">${internshipsHTML}</div>`;
        return;
    }

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