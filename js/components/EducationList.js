class EducationList extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        try {
            const response = await fetch('/data/education.json');
            const data = await response.json();
            this.render(data.education);
        } catch (error) {
            console.error('Error loading education data:', error);
            this.innerHTML = '<p>Error loading education data</p>';
        }
    }

    render(educationList) {
        const educationHTML = educationList.map(edu => `
            <div class="education-item">
                <div class="school-logo">
                    <img src="${edu.logo}" alt="${edu.school} Logo">
                </div>
                <div class="education-info">
                    <h3 class="school-name">${edu.school}</h3>
                    <p class="degree">${edu.degree}</p>
                    <div class="education-meta">
                        <p class="education-period">
                            <i class="far fa-calendar-alt"></i>
                            <span>${edu.period}</span>
                        </p>
                        <p class="education-period">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${edu.location}</span>
                        </p>
                        <p class="education-period">
                            <span>${edu.research}</span>
                        </p>
                    </div>
                </div>
            </div>
        `).join('');

        this.innerHTML = `
            <div class="education-list">
                ${educationHTML}
            </div>
        `;
    }
}

customElements.define('education-list', EducationList);