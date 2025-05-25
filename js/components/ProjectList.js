class ProjectList extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        try {
            const response = await fetch('/data/projects.json');
            const data = await response.json();
            this.render(data.projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            this.innerHTML = '<p>Error loading projects</p>';
        }
    }

    render(projects) {
        this.innerHTML = `
            <div class="card-content">
                <div class="projects-list">
                    ${projects.map(project => `
                        <div class="project-item">
                            <div class="project-header">
                                <h4 class="project-name">${project.name}</h4>
                                <div class="project-links">
                                    ${project.github_url ? `
                                        <a href="${project.github_url}" class="project-link">
                                            <i class="fab fa-github"></i>
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                            <p class="project-description">${project.description}</p>
                            <div class="project-tech">
                                ${project.tech_tags.map(tag => `
                                    <span class="tech-tag">${tag}</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

customElements.define('project-list', ProjectList);