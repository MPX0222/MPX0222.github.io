class DetailedPublicationList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.publications = [];
        this.filteredPublications = [];
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'copy-tooltip';
        document.body.appendChild(this.tooltip);
    }

    showTooltip(text, x, y) {
        this.tooltip.textContent = text;
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y - 40}px`;
        this.tooltip.classList.add('show');
        setTimeout(() => {
            this.tooltip.classList.remove('show');
        }, 2000);
    }

    async copyToClipboard(text, button, event) {
        try {
            await navigator.clipboard.writeText(text);
            button.classList.add('cite-success');
            this.showTooltip('已复制引用到剪贴板！', event.clientX, event.clientY);
            setTimeout(() => {
                button.classList.remove('cite-success');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            this.showTooltip('复制失败，请重试', event.clientX, event.clientY);
        }
    }

    async connectedCallback() {
        try {
            const response = await fetch('/data/publications.json');
            const data = await response.json();
            this.publications = data.publications;
            this.filteredPublications = [...this.publications];
            this.syncThemeFromDocument();
            this.setupThemeObserver();
            this.render();
        } catch (error) {
            console.error('Error loading publications:', error);
            this.shadowRoot.innerHTML = '<p>Error loading publications</p>';
        }
    }

    syncThemeFromDocument() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme) {
            this.setAttribute('data-theme', theme);
        } else {
            this.removeAttribute('data-theme');
        }
        const list = this.shadowRoot?.querySelector('.publications-list');
        if (list) {
            list.classList.toggle('is-dark', theme === 'dark');
        }
    }

    setupThemeObserver() {
        this.themeObserver = new MutationObserver(() => this.syncThemeFromDocument());
        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
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

    resolveThumbnail(path) {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/${path}`;
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

            const thumbnailSrc = this.resolveThumbnail(pub.thumbnail);
            const categoryBadge = pub.category
                ? `<span class="category-tag ${categoryClass}">${pub.category}</span>`
                : '';
            const thumbnail = thumbnailSrc ? `
                <div class="publication-thumbnail">
                    <img src="${thumbnailSrc}" alt="" loading="lazy">
                    ${categoryBadge}
                </div>
            ` : '';

            const showDoiBadge = false;
            const doiUrl = pub.doi
                ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`)
                : '';

            return `
                <div class="publication-item">
                    ${thumbnail}
                    <div class="publication-body">
                        <div class="publication-title">${title}</div>
                        <div class="publication-meta">
                            ${authors}
                        </div>
                        <div class="publication-footer">
                            <div class="publication-left">
                                <div class="publication-venue">
                                    <span class="venue-tag ${venueInfo.class}">${pub.venue.name}</span>
                                    ${!thumbnailSrc ? categoryBadge : ''}
                                </div>
                                <div class="publication-links">
                                    ${pub.links.pdf ? `
                                        <a href="${pub.links.pdf}" class="pub-link pdf-link" target="_blank" rel="noopener">
                                            <i class="ai ai-arxiv"></i>
                                            <span>Paper</span>
                                        </a>
                                    ` : ''}
                                    ${pub.links.code ? `
                                        <a href="${pub.links.code}" class="pub-link code-link" target="_blank" rel="noopener">
                                            <i class="fab fa-github"></i>
                                            <span>Code</span>
                                        </a>
                                    ` : ''}
                                    ${pub.links.web ? `
                                        <a href="${pub.links.web}" class="pub-link web-link" target="_blank" rel="noopener">
                                            <i class="fas fa-globe"></i>
                                            <span>Website</span>
                                        </a>
                                    ` : ''}
                                    <button class="pub-link cite-button cite-link" data-bibtex="${(pub.bibtex || '').replace(/"/g, '&quot;')}" aria-label="Copy BibTeX citation">
                                        <i class="fas fa-paperclip"></i>
                                        <span>Bibtex</span>
                                    </button>
                                    ${showDoiBadge && pub.doi ? `
                                        <a href="${doiUrl}" class="pub-link doi-link" target="_blank" rel="noopener" title="${pub.doi}">
                                            <i class="ai ai-doi"></i>
                                            <span>DOI</span>
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="publication-stats">
                                <div class="citation-count">
                                    <span>${pub.stats.citations} citations</span>
                                </div>
                                ${pub.links.github && pub.links.github.owner && pub.links.github.repo ? `
                                    <a class="github-stats" href="https://github.com/${pub.links.github.owner}/${pub.links.github.repo}" target="_blank" rel="noopener noreferrer" title="View repository on GitHub">
                                        <img src="https://img.shields.io/github/stars/${pub.links.github.owner}/${pub.links.github.repo}?style=social&label=Star"
                                             alt="GitHub stars" loading="lazy">
                                    </a>
                                ` : ''}
                            </div>
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
                    display: flex;
                    align-items: flex-start;
                    gap: 1.35rem;
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

                .publication-thumbnail {
                    position: relative;
                    flex: 0 0 220px;
                    width: 220px;
                    height: auto;
                    aspect-ratio: 2 / 1;
                    border-radius: 6px;
                    overflow: hidden;
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }

                .publication-thumbnail img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center;
                    padding: 3pt;
                    transition: transform 0.35s ease;
                }

                .publication-item:hover .publication-thumbnail img {
                    transform: scale(1.03);
                }

                :host-context([data-theme="dark"]) .publication-thumbnail {
                    background: #1e293b;
                    border-color: rgba(255, 255, 255, 0.12);
                    box-shadow: none;
                }

                .publication-body {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
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

                .doi-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    padding: 0.2rem 0.55rem;
                    border-radius: 4px;
                    text-decoration: none;
                    background: rgba(108, 92, 231, 0.1);
                    color: #6c5ce7;
                    transition: all 0.2s ease;
                }

                .doi-tag:hover {
                    background: rgba(108, 92, 231, 0.18);
                    color: #5b4cdb;
                }

                :host-context([data-theme="dark"]) .doi-tag {
                    background: rgba(162, 155, 254, 0.15);
                    color: #a29bfe;
                }

                :host-context([data-theme="dark"]) .doi-tag:hover {
                    background: rgba(162, 155, 254, 0.25);
                    color: #c7c2ff;
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

                .publication-left {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                }

                .publication-venue {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }

                .publication-links {
                    display: flex;
                    gap: 0.1rem;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .pub-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.8125rem;
                    text-decoration: none;
                    font-weight: 500;
                    color: var(--primary-color, #6c5ce7);
                    cursor: pointer;
                    transition: color 0.2s ease;
                    line-height: 1;
                    padding: 0.25rem 0.5rem;
                    height: 1.75rem;
                    box-sizing: border-box;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    background: none;
                    border: none;
                    margin: 0;
                }

                .pub-link:hover {
                    text-decoration: underline;
                    color: var(--primary-color, #6c5ce7);
                }

                .pub-link.cite-success {
                    color: #16a34a;
                }

                .publication-stats {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .github-stats {
                    display: inline-flex;
                    align-items: center;
                    text-decoration: none;
                    line-height: 1;
                    border-radius: 3px;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                }

                .github-stats:hover {
                    transform: translateY(-1px);
                    opacity: 0.9;
                }

                .github-stats img {
                    height: 15px;
                    width: auto;
                    display: block;
                    border-radius: 2.5px;
                }

                :host-context([data-theme="dark"]) .github-stats img {
                    filter: invert(0.88) hue-rotate(180deg) contrast(1.05);
                }

                .venue-tag {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.1875rem 0.375rem;
                    border-radius: 3px;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    letter-spacing: 0.025em;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    text-transform: none;
                    transition: all 0.3s ease;
                }

                .venue-tag.preprint {
                    background-color: #fef2f2;
                    color: #dc2626;
                }

                .venue-tag.conference {
                    background-color: #f0fdf4;
                    color: #16a34a;
                }

                .venue-tag.journal {
                    background-color: #eff6ff;
                    color: #2563eb;
                }

                .publications-list.is-dark .venue-tag {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    background-color: rgba(255, 255, 255, 0.05);
                    color: #94a3b8;
                }

                .publications-list.is-dark .venue-tag.preprint {
                    background-color: rgba(239, 68, 68, 0.15);
                    color: #fca5a5;
                }

                .publications-list.is-dark .venue-tag.conference {
                    background-color: rgba(34, 197, 94, 0.15);
                    color: #86efac;
                }

                .publications-list.is-dark .venue-tag.journal {
                    background-color: rgba(59, 130, 246, 0.15);
                    color: #93c5fd;
                }

                .category-tag {
                    position: absolute;
                    top: 10px;
                    left: 0;
                    z-index: 1;
                    display: inline-flex;
                    align-items: center;
                    max-width: calc(100% - 8px);
                    padding: 0.2rem 0.5rem 0.2rem 0.42rem;
                    border-radius: 0 4px 4px 0;
                    font-size: 0.625rem;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    line-height: 1.2;
                    font-family: var(--font-sansation, 'Sansation', sans-serif);
                    color: #ffffff;
                    background: #6c5ce7;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
                    pointer-events: none;
                }

                .category-tag.database { background: #6c5ce7; color: #ffffff; }
                .category-tag.finance { background: #16a34a; color: #ffffff; }
                .category-tag.llm { background: #d35400; color: #ffffff; }
                .category-tag.ml { background: #2980b9; color: #ffffff; }

                :host-context([data-theme="dark"]) .category-tag.database { background: #6c5ce7; color: #ffffff; }
                :host-context([data-theme="dark"]) .category-tag.finance { background: #16a34a; color: #ffffff; }
                :host-context([data-theme="dark"]) .category-tag.llm { background: #d35400; color: #ffffff; }
                :host-context([data-theme="dark"]) .category-tag.ml { background: #2980b9; color: #ffffff; }

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
                    .publication-item {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .publication-thumbnail {
                        width: 100%;
                        flex: none;
                        height: auto;
                        aspect-ratio: 2 / 1;
                    }
                    .publication-title { font-size: 1.15rem; }
                    .publication-meta { padding-right: 0; max-width: 100%; }
                    .publication-footer { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
                    .publication-left { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
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
            this.syncThemeFromDocument();
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
        this.syncThemeFromDocument();
        this.bindCiteButtons();
    }

    bindCiteButtons() {
        if (!document.getElementById('detailed-copy-tooltip-style')) {
            const tooltipStyle = document.createElement('style');
            tooltipStyle.id = 'detailed-copy-tooltip-style';
            tooltipStyle.textContent = `
                .copy-tooltip {
                    position: fixed;
                    background-color: #111827;
                    color: white;
                    padding: 0.25rem 0.375rem;
                    border-radius: 3px;
                    font-size: 0.6875rem;
                    font-weight: 500;
                    pointer-events: none;
                    opacity: 0;
                    z-index: 9999;
                    transition: opacity 0.2s ease;
                }
                .copy-tooltip.show { opacity: 1; }
            `;
            document.head.appendChild(tooltipStyle);
        }

        this.shadowRoot.querySelectorAll('.cite-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const bibtex = button.dataset.bibtex;
                this.copyToClipboard(bibtex, button, event);
            });
        });
    }
}

customElements.define('detailed-publication-list', DetailedPublicationList);
