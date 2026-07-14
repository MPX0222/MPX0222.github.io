class DetailedPublicationList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.publications = [];
        this.filteredPublications = [];
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

    groupByYear(publications) {
        const groups = {};
        publications.forEach(pub => {
            const year = pub.year;
            if (!groups[year]) groups[year] = [];
            groups[year].push(pub);
        });
        return Object.keys(groups)
            .sort((a, b) => Number(b) - Number(a))
            .map(year => ({ year, publications: groups[year] }));
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

    getCategoryClass(category) {
        const map = {
            'ai for database': 'database',
            'ai for finance': 'finance',
            'large language models': 'llm',
            'machine learning': 'ml'
        };
        return map[(category || '').trim().toLowerCase()] || 'default';
    }

    getFilterCount(filter) {
        if (!this.publications || this.publications.length === 0) return 0;

        if (filter === 'all') {
            return this.publications.length;
        }

        if (['conference', 'journal', 'preprint'].includes(filter)) {
            return this.publications.filter(pub => {
                const venueType = pub.venue.type.toLowerCase();
                return venueType.includes(filter.toLowerCase());
            }).length;
        }

        const normalizedFilter = filter.trim().toLowerCase();
        return this.publications.filter(pub =>
            (pub.category || '').trim().toLowerCase() === normalizedFilter
        ).length;
    }

    filterPublications(filter) {
        if (filter === 'all') {
            this.filteredPublications = [...this.publications];
        } else if (['conference', 'journal', 'preprint'].includes(filter)) {
            this.filteredPublications = this.publications.filter(pub => {
                const venueType = pub.venue.type.toLowerCase();
                return venueType.includes(filter.toLowerCase());
            });
        } else {
            const normalizedFilter = filter.trim().toLowerCase();
            this.filteredPublications = this.publications.filter(pub =>
                (pub.category || '').trim().toLowerCase() === normalizedFilter
            );
        }
        this.render();
    }

    renderPublicationItems(publications) {
        return publications.map(pub => {
            const venueInfo = this.getVenueInfo(pub.venue.type);
            const categoryClass = this.getCategoryClass(pub.category);
            const title = pub.links.pdf ?
                `<a href="${pub.links.pdf}" class="pdf-link" target="_blank">${pub.title}</a>` :
                pub.title;

            const authors = pub.authors.map(author =>
                author === "Peixian Ma" || author === "Peixian Ma*" ?
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
                            <span class="venue-tag ${venueInfo.class}">${pub.venue.name}</span>
                            ${pub.category ? `<span class="category-tag ${categoryClass}">${pub.category}</span>` : ''}
                        </div>
                        <div class="citation-count">
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
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .publication-year-group {
                    margin-top: 2.5rem;
                }

                .publication-year-group:first-child {
                    margin-top: 0;
                }

                .publication-year-label {
                    display: inline-block;
                    width: fit-content;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    font-size: 1.5rem;
                    font-weight: 600;
                    letter-spacing: 0.01em;
                    margin-bottom: 0.5rem;
                    line-height: 1.3;
                    color: var(--text-color);
                    transition: color 0.3s ease;
                }

                :host-context([data-theme="dark"]) .publication-year-label {
                    color: #ffffff;
                }

                .publication-year-items {
                    display: flex;
                    flex-direction: column;
                }

                .publication-item {
                    padding: 1.5rem 0;
                    border-bottom: 1px solid var(--border-color);
                    transition: border-color 0.3s ease;
                }

                :host-context([data-theme="dark"]) .publication-item {
                    border-bottom-color: rgba(255, 255, 255, 0.1);
                }

                .publication-year-group .publication-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .publication-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text-color);
                    line-height: 1.4;
                    margin-bottom: 0.5rem;
                    display: block;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                :host-context([data-theme="dark"]) .publication-title {
                    color: #ffffff;
                }

                .publication-title:hover,
                .pdf-link:hover {
                    color: var(--primary-color);
                }

                .pdf-link {
                    color: inherit;
                    text-decoration: none;
                }

                .publication-meta {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 0.75rem;
                    max-width: min(100%, 52rem);
                    padding-right: 7rem;
                }

                :host-context([data-theme="dark"]) .publication-meta {
                    color: #cbd5e1;
                }

                .author-highlight {
                    color: var(--primary-color);
                    font-weight: 600;
                    text-decoration: none;
                }

                :host-context([data-theme="dark"]) .author-highlight {
                    color: var(--primary-light);
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
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }

                .venue-tag {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    color: #6c5ce7;
                    border-left: 2px solid #6c5ce7;
                    padding-left: 0.75rem;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    text-transform: none;
                    transition: all 0.3s ease;
                }

                .venue-tag.conference { border-left-color: #27ae60; color: #27ae60; }
                .venue-tag.journal { border-left-color: #2563eb; color: #2563eb; }
                .venue-tag.preprint { border-left-color: #dc2626; color: #dc2626; }

                :host-context([data-theme="dark"]) .venue-tag {
                    border-left: none;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    background: rgba(162, 155, 254, 0.15);
                    color: #a29bfe;
                }

                :host-context([data-theme="dark"]) .venue-tag.conference { background: rgba(85, 239, 196, 0.15); color: #55efc4; }
                :host-context([data-theme="dark"]) .venue-tag.journal { background: rgba(116, 185, 255, 0.15); color: #74b9ff; }
                :host-context([data-theme="dark"]) .venue-tag.preprint { background: rgba(250, 177, 160, 0.15); color: #fab1a0; }

                .category-tag {
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    padding: 0.2rem 0.55rem;
                    border-radius: 4px;
                    background: rgba(108, 92, 231, 0.1);
                    color: #6c5ce7;
                    transition: all 0.3s ease;
                }

                .category-tag.database { background: rgba(108, 92, 231, 0.1); color: #6c5ce7; }
                .category-tag.finance { background: rgba(39, 174, 96, 0.1); color: #27ae60; }
                .category-tag.llm { background: rgba(211, 84, 0, 0.1); color: #d35400; }
                .category-tag.ml { background: rgba(41, 128, 185, 0.1); color: #2980b9; }

                :host-context([data-theme="dark"]) .category-tag.database { background: rgba(162, 155, 254, 0.15); color: #a29bfe; }
                :host-context([data-theme="dark"]) .category-tag.finance { background: rgba(85, 239, 196, 0.15); color: #55efc4; }
                :host-context([data-theme="dark"]) .category-tag.llm { background: rgba(250, 177, 160, 0.15); color: #fab1a0; }
                :host-context([data-theme="dark"]) .category-tag.ml { background: rgba(116, 185, 255, 0.15); color: #74b9ff; }

                .citation-count {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    opacity: 0.8;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                }

                .empty-state i {
                    font-size: 1.5rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }

                @media (max-width: 768px) {
                    .publication-year-label { font-size: 1.35rem; }
                    .publication-title { font-size: 1.15rem; }
                    .publication-meta { padding-right: 0; max-width: 100%; }
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

        const yearGroupsHTML = this.groupByYear(this.filteredPublications).map(group => `
            <section class="publication-year-group">
                <div class="publication-year-label">${group.year}</div>
                <div class="publication-year-items">
                    ${this.renderPublicationItems(group.publications)}
                </div>
            </section>
        `).join('');

        this.shadowRoot.innerHTML = `${styles}<div class="publications-list">${yearGroupsHTML}</div>`;
    }
}

customElements.define('detailed-publication-list', DetailedPublicationList);
