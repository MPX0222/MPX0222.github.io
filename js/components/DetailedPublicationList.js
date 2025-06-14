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

    getVenueType(venueName) {
        const venueTypes = {
            'arXiv': 'preprint',
            'NeurIPS': 'conference',
            'ICML': 'conference',
            'ICLR': 'conference',
            'Frontiers': 'journal',
            'Nature': 'journal',
            'Science': 'journal'
        };

        for (const [key, value] of Object.entries(venueTypes)) {
            if (venueName.includes(key)) {
                return value;
            }
        }
        return 'preprint';
    }

    render() {
        const styles = `
            <style>
                .publication-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .publication-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .publication-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                }

                .publication-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }

                .publication-content {
                    padding: 1.5rem;
                }

                .publication-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #2d3436;
                    margin-bottom: 1rem;
                    line-height: 1.4;
                }

                .publication-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .publication-year {
                    color: #636e72;
                    font-size: 0.9rem;
                }

                .publication-venue {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.6rem;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: white;
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
                }

                .publication-stats {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #eee;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #636e72;
                    font-size: 0.9rem;
                }

                .stat-item i {
                    color: #6c5ce7;
                }

                .publication-links {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }

                .pub-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                    text-decoration: none;
                    border-radius: 6px;
                    background: #f8f9fa;
                    color: #2d3436;
                    transition: all 0.3s ease;
                }

                .pub-link:hover {
                    background: #e9ecef;
                }

                .pub-link i {
                    font-size: 1rem;
                }

                .author {
                    color: #6c5ce7;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .publication-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        const publicationsHTML = this.filteredPublications.map(pub => `
            <div class="publication-card">
                <img src="../${pub.thumbnail}" alt="${pub.title}" class="publication-image">
                <div class="publication-content">
                    <h3 class="publication-title">${pub.title}</h3>
                    <div class="publication-meta">
                        <div class="publication-year">${pub.year}</div>
                        <div class="publication-venue">${pub.venue.name}</div>
                        <div class="publication-authors">
                            ${pub.authors.map(author => 
                                author === "Peixian Ma" ? 
                                `<span class="author">${author}</span>` : 
                                author
                            ).join(', ')}
                        </div>
                    </div>
                    <div class="publication-stats">
                        <div class="stat-item">
                            <i class="fas fa-quote-right"></i>
                            <span>${pub.stats.citations} Citations</span>
                        </div>
                    </div>
                    <div class="publication-links">
                        ${pub.links.pdf ? `
                            <a href="${pub.links.pdf}" class="pub-link" target="_blank">
                                <i class="fas fa-file-pdf"></i>
                                PDF
                            </a>
                        ` : ''}
                        ${pub.links.code ? `
                            <a href="${pub.links.code}" class="pub-link" target="_blank">
                                <i class="fab fa-github"></i>
                                Code
                            </a>
                        ` : ''}
                        ${pub.links.cite ? `
                            <a href="${pub.links.cite}" class="pub-link" target="_blank">
                                <i class="fas fa-quote-right"></i>
                                Cite
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        this.shadowRoot.innerHTML = `
            ${styles}
            <div class="publication-grid">
                ${publicationsHTML}
            </div>
        `;
    }
}

customElements.define('detailed-publication-list', DetailedPublicationList); 