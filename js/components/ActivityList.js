class ActivityList extends HTMLElement {
    constructor() {
        super();
        this.loadActivities();
    }

    async loadActivities() {
        try {
            const response = await fetch('/data/activities.json');
            const data = await response.json();
            this.render(data.activities);
        } catch (error) {
            console.error('Error loading activities:', error);
            this.innerHTML = '<p>Error loading activities data.</p>';
        }
    }

    render(activities) {
        const isCompact = this.getAttribute('mode') === 'compact';

        if (isCompact) {
            this.innerHTML = `
                <div class="activities-list compact">
                    ${activities.map(category => `
                        <div class="activity-category-compact">
                            ${category.items.length ? category.items.map(item => `
                                <div class="activity-compact-item">
                                    <span class="activity-compact-tag ${category.category.toLowerCase()}">${category.category}</span>
                                    <span class="activity-description">${item.description}</span>
                                </div>
                            `).join('') : `
                                <div class="activity-compact-item">
                                    <span class="activity-compact-tag ${category.category.toLowerCase()}">${category.category}</span>
                                    <span class="activity-description activity-empty">No activities yet.</span>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
}

customElements.define('activity-list', ActivityList);
