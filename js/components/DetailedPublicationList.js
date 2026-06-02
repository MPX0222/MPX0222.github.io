class DetailedPublicationList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.publications = [];
        this.filteredPublications = [];
        this.groupedView = true;
        this.currentCategory = 'all';
    }

    async connectedCallback() {
        try {
            const response = await fetch('/data/publications.json');
            const data = await response.json();
            this.publications = data.publications;
            this.filteredPublications = [...this.publications];
            this.render();
        } catch (error) {
            console.error('Error loading publications:', error);
            this.shadowRoot.innerHTML = '<p>Error loading publications</p>';
        }
    }

    groupPublicationsByCategory() {
        const grouped = {};

        this.filteredPublications.forEach(pub => {
            const category = pub.category || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(pub);
        });

        return grouped;
    }

    getVenueInfo(venueType) {
        const type = venueType.toLowerCase();
        if (type.includes('conference')) {
            return { class: 'conference', label: 'Conference' };
        } else if (type.includes('journal')) {
            return { class: 'journal', label: 'Journal' };
        } else {
            return { class: 'preprint', label: 'Preprint' };
        }
    }

    filterPublications(filter) {
        if (filter === 'all') {
            this.filteredPublications = [...this.publications];
            this.currentCategory = 'all';
        } else if (['conference', 'journal', 'preprint'].includes(filter)) {
            this.filteredPublications = this.publications.filter(pub => {
                const venueType = pub.venue.type.toLowerCase();
                return venueType.includes(filter.toLowerCase());
            });
            this.currentCategory = 'all';
        } else {
            const normalizedFilter = filter.trim().toLowerCase();
            this.filteredPublications = this.publications.filter(pub =>
                (pub.category || '').trim().toLowerCase() === normalizedFilter
            );
            this.currentCategory = filter;
        }
        this.render();
    }

    renderPublicationItems(publications) {
        return publications.map(pub => {
            const venueInfo = this.getVenueInfo(pub.venue.type);
            const title = pub.links.pdf ?
                `<a href="${pub.links.pdf}" class="pdf-link" target="_blank"><i class="ai ai-arxiv" style="margin-right: 8px; font-size: 1.1em; vertical-align: middle;"></i>${pub.title}</a>` :
                pub.title;

            const authors = pub.authors.map(author =>
                author === "Peixian Ma" ?
                `<span class="author-highlight">${author}</span>` :
                author
            ).join(', ');

            return `
                <div class="publication-item">
                    <div class="publication-title">${title}</div>
                    <div class="publication-meta">
                        ${authors}
                    </div>
                    <div class="publication-footer">
                        <div class="publication-venue">
                            <span class="venue-tag ${venueInfo.class}">${venueInfo.label}</span>
                            <span class="venue-name">${pub.venue.name}</span>
                        </div>
                        <div class="citation-count">
                            <i class="fas fa-quote-right"></i>
                            <span>${pub.stats.citations} citations</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    render() {
        const styles = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jpswalsh/academicons@1/css/academicons.min.css">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .publications-list {
                    background: transparent;
                    border-radius: 0;
                    overflow: visible;
                    box-shadow: none;
                    font-family: var(--font-family, 'Lora', serif);
                }

                .category-section {
                    margin-bottom: 4rem;
                    background: transparent;
                }

                .category-header {
                    background: none;
                    padding: 0;
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.5rem;
                    border-left: 4px solid #6c5ce7;
                    padding-left: 1.5rem;
                }

                .category-title {
                    font-family: var(--font-family);
                    font-size: 1.8rem;
                    color: var(--text-color);
                    margin: 0;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }

                .category-count {
                    background: none;
                    color: var(--text-secondary);
                    padding: 0;
                    font-size: 0.9rem;
                    font-weight: 500;
                    font-family: 'Inter', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .publication-item {
                    padding: 2rem 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                :host-context([data-theme="dark"]) .publication-item {
                    border-bottom-color: rgba(255, 255, 255, 0.05);
                }

                .publication-item:last-child {
                    border-bottom: none;
                }

                .publication-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: var(--text-color);
                    line-height: 1.4;
                    margin-bottom: 0.75rem;
                    display: block;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                :host-context([data-theme="dark"]) .publication-title {
                    color: #ffffff;
                }

                .publication-title:hover {
                    color: #6c5ce7;
                }

                :host-context([data-theme="dark"]) .publication-title:hover {
                    color: #a29bfe;
                }

                .pdf-link {
                    color: inherit;
                    text-decoration: none;
                }

                .publication-meta {
                    font-size: 1rem;
                    color: var(--text-color);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                :host-context([data-theme="dark"]) .publication-meta {
                    color: #cbd5e1;
                }

                .author-highlight {
                    color: #6c5ce7;
                    font-weight: 700;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                    text-decoration-thickness: 2px;
                    text-decoration-color: rgba(108, 92, 231, 0.3);
                }

                :host-context([data-theme="dark"]) .author-highlight {
                    color: #a29bfe;
                    text-decoration-color: rgba(162, 155, 254, 0.3);
                }

                .publication-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .publication-venue {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .venue-tag {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #6c5ce7;
                    border-left: 2px solid #6c5ce7;
                    padding-left: 0.75rem;
                    font-family: 'Inter', sans-serif;
                }

                :host-context([data-theme="dark"]) .venue-tag {
                    color: #a29bfe;
                    border-left-color: #a29bfe;
                }

                .venue-tag.conference { border-left-color: #27ae60; color: #27ae60; }
                .venue-tag.journal { border-left-color: #2563eb; color: #2563eb; }
                .venue-tag.preprint { border-left-color: #dc2626; color: #dc2626; }

                :host-context([data-theme="dark"]) .venue-tag.conference { border-left-color: #55efc4; color: #55efc4; }
                :host-context([data-theme="dark"]) .venue-tag.journal { border-left-color: #74b9ff; color: #74b9ff; }
                :host-context([data-theme="dark"]) .venue-tag.preprint { border-left-color: #fab1a0; color: #fab1a0; }

                .venue-name {
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                :host-context([data-theme="dark"]) .venue-name {
                    color: #cbd5e1;
                }

                .citation-count {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                }

                :host-context([data-theme="dark"]) .citation-count {
                    color: #cbd5e1;
                }

                .citation-count i {
                    font-size: 0.8rem;
                    color: #6c5ce7;
                }

                :host-context([data-theme="dark"]) .citation-count i {
                    color: #a29bfe;
                }

                /* 深色模式适配 */
                :host-context([data-theme="dark"]) .category-title {
                    color: #ffffff;
                }

                :host-context([data-theme="dark"]) .category-count {
                    color: #94a3b8;
                }

                @media (max-width: 768px) {
                    .category-title { font-size: 1.5rem; }
                    .publication-title { font-size: 1.15rem; }
                    .publication-footer { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
                }
            </style>
        `;

        if (this.filteredPublications.length === 0) {
            this.shadowRoot.innerHTML = `
                ${styles}
                <div class="publications-list">
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <div>No publications found</div>
                    </div>
                </div>
            `;
            return;
        }

        if (this.groupedView && this.currentCategory === 'all') {
            const groupedPubs = this.groupPublicationsByCategory();
            const categoriesHTML = Object.entries(groupedPubs).map(([category, pubs]) => `
                <div class="category-section">
                    <div class="category-header">
                        <h3 class="category-title">${category}</h3>
                        <span class="category-count">${pubs.length} publications</span>
                    </div>
                    <div class="category-publications">
                        ${this.renderPublicationItems(pubs)}
                    </div>
                </div>
            `).join('');

            this.shadowRoot.innerHTML = `${styles}<div class="publications-list">${categoriesHTML}</div>`;
        } else {
            const publicationsHTML = this.renderPublicationItems(this.filteredPublications);
            this.shadowRoot.innerHTML = `${styles}<div class="publications-list">${publicationsHTML}</div>`;
        }
    }
}

customElements.define('detailed-publication-list', DetailedPublicationList);
