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

    filterPublications(filter) {
        if (filter === 'all') {
            this.filteredPublications = [...this.publications];
        } else {
            this.filteredPublications = this.publications.filter(pub => {
                const venueType = pub.venue.type.toLowerCase();
                return venueType.includes(filter.toLowerCase());
            });
        }
        this.render();
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
                    font-family: 'Georama', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                    text-decoration: none;
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
                }

                .author-highlight {
                    color: #6c5ce7;
                    font-weight: 600;
                }

                .venue-info {
                    color: #0984e3;
                    font-weight: 500;
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
                    .publication-item {
                        padding: 1rem;
                    }

                    .publication-title {
                        font-size: 1rem;
                    }

                    .publication-meta {
                        font-size: 0.85rem;
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

        const publicationsHTML = this.filteredPublications.map(pub => {
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
                        ${authors} • <span class="venue-info">${pub.venue.name}</span>
                    </div>
                </div>
            `;
        }).join('');

        this.shadowRoot.innerHTML = `
            ${styles}
            <div class="publications-list">
                ${publicationsHTML}
            </div>
        `;
    }
}

customElements.define('detailed-publication-list', DetailedPublicationList); 