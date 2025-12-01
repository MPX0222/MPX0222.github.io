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
        const isCompact = this.getAttribute('mode') === 'compact';
        
        if (isCompact) {
            const educationHTML = educationList.map(edu => `
                <div class="compact-list-item">
                    <div class="compact-details">
                        <div class="compact-header">
                            <span class="compact-title">${edu.school}</span>
                            <span class="compact-date">${edu.period}</span>
                        </div>
                        <div class="compact-subtitle">${edu.degree}</div>
                    </div>
                </div>
            `).join('');
            this.innerHTML = `<div class="education-list compact">${educationHTML}</div>`;
            return;
        }

        const educationHTML = educationList.map(edu => `
            <div class="education-item">
                <div class="education-header">
                    <div class="school-logo">
                        <img src="${edu.logo}" alt="${edu.school} Logo">
                    </div>
                    <div class="education-title">
                        <h3 class="school-name">${edu.school}</h3>
                        <p class="degree">${edu.degree}</p>
                    </div>
                    <div class="education-period">
                        <i class="far fa-calendar-alt"></i>
                        <span>${edu.period}</span>
                    </div>
                </div>
                <div class="education-details">
                    <div class="education-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${edu.location}</span>
                    </div>
                    <div class="research-focus">
                        <i class="fas fa-microscope"></i>
                        <span>${edu.research}</span>
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