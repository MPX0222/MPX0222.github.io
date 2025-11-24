class ServiceList extends HTMLElement {
    constructor() {
        super();
        this.loadServices();
    }

    async loadServices() {
        try {
            const response = await fetch('/data/services.json');
            const data = await response.json();
            this.render(data.services);
        } catch (error) {
            console.error('Error loading services:', error);
            this.innerHTML = '<p>Error loading services data.</p>';
        }
    }

    render(services) {
        const isCompact = this.getAttribute('mode') === 'compact';

        if (isCompact) {
            this.innerHTML = `
                <div class="services-list compact">
                    ${services.map(category => `
                        <div class="service-category-compact">
                            ${category.items.map(item => `
                                <div class="service-compact-item">
                                    <span class="service-compact-tag ${item.tag.toLowerCase()}">${item.tag}</span>
                                    <span class="service-description">${item.description}</span>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
            return;
        }

        this.innerHTML = `
            <div class="services-list">
                ${services.map(category => `
                    <div class="service-category">
                        <h3 class="category-title">${category.category}</h3>
                        <ul class="service-items">
                            ${category.items.map(item => `
                                <li>
                                    <span class="service-tag ${item.tag.toLowerCase()}">${item.tag}</span>
                                    ${item.description}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

customElements.define('service-list', ServiceList);