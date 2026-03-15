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
            this.filteredPublications = this.publications.filter(pub =>
                pub.category === filter
            );
            this.currentCategory = filter;
        }
        this.render();
    }

    renderPublicationItems(publications) {
        return publications.map(pub => {
            const venueInfo = this.getVenueInfo(pub.venue.type);
            const title = pub.links.pdf ?
                `<a href="${pub.links.pdf}" class="pdf-link" target="_blank">${pub.title}</a>` :
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
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .publications-list {
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    font-family: 'Lora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .category-section {
                    margin-bottom: 2rem;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .category-section:last-child {
                    margin-bottom: 0;
                }

                .category-header {
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .category-title {
                    font-family: 'Dancing Script', cursive;
                    font-size: 1.5rem;
                    color: white;
                    margin: 0;
                    font-weight: 600;
                }

                .category-count {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .category-publications {
                    padding: 0;
                }

                .publication-item {
                    padding: 1.2rem 1.5rem;
                    border-bottom: 1px solid #f1f3f4;
                }

                .publication-item:last-child {
                    border-bottom: none;
                }

                .publication-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #2d3436;
                    line-height: 1.4;
                    margin-bottom: 0.5rem;
                    display: inline;
                }

                .publication-title:hover {
                    color: #6c5ce7;
                }

                .pdf-link {
                    color: #6c5ce7;
                    text-decoration: none;
                    font-weight: 600;
                }

                .pdf-link:hover {
                    text-decoration: underline;
                }

                .publication-meta {
                    font-size: 0.9rem;
                    color: #636e72;
                    line-height: 1.4;
                    margin-bottom: 0.75rem;
                }

                .author-highlight {
                    color: #6c5ce7;
                    font-weight: 600;
                }

                .publication-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .publication-venue {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .venue-tag {
                    display: inline-flex;
                    align-items: center;
                    padding: 0;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    color: #475569;
                }

                .venue-name {
                    color: #64748b;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .citation-count {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .citation-count i {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 2rem;
                    color: #636e72;
                }

                .empty-state i {
                    font-size: 2rem;
                    color: #ddd;
                    margin-bottom: 1rem;
                }

                @media (max-width: 768px) {
                    .category-title {
                        font-size: 1.25rem;
                    }

                    .category-header {
                        padding: 0.75rem 1rem;
                    }

                    .category-count {
                        font-size: 0.8rem;
                        padding: 0.2rem 0.6rem;
                    }

                    .publication-item {
                        padding: 1rem;
                    }

                    .publication-title {
                        font-size: 1rem;
                    }

                    .publication-meta {
                        font-size: 0.85rem;
                    }

                    .publication-footer {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .venue-tag {
                        font-size: 0.7rem;
                        padding: 0.2rem 0.5rem;
                    }

                    .citation-count {
                        font-size: 0.8rem;
                    }
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
