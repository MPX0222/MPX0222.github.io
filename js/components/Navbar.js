class Navbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const styles = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    font-family: var(--font-family, 'Lora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                    --nav-bg: rgba(255, 255, 255, 0.95);
                    --nav-border: rgba(30, 55, 153, 0.08);
                    --nav-text: #57606f;
                    --nav-active: #6c5ce7;
                }

                :host-context([data-theme="dark"]) {
                    --nav-bg: rgba(0, 0, 0, 0.95);
                    --nav-border: rgba(255, 255, 255, 0.15);
                    --nav-text: #cbd5e1;
                    --nav-active: #a29bfe;
                }

                .navbar {
                    background: var(--nav-bg);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--nav-border);
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    opacity: 0;
                    animation: fadeInDown 0.3s ease-out forwards;
                    transition: background 0.3s ease, border 0.3s ease;
                }

                .nav-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0.75rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .nav-brand {
                    font-weight: 700;
                    font-size: 1.3rem;
                    background: linear-gradient(135deg, var(--nav-text), var(--nav-active));
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                :host-context([data-theme="dark"]) .nav-brand {
                    background: linear-gradient(135deg, #f8fafc, var(--nav-active));
                    -webkit-background-clip: text;
                    background-clip: text;
                }

                .nav-brand svg {
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, var(--nav-text), var(--nav-active));
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .nav-brand:hover {
                    transform: translateY(-1px);
                    opacity: 0.85;
                }

                .version {
                    font-size: 0.75rem;
                    font-weight: 500;
                    background: linear-gradient(135deg, var(--nav-text), var(--nav-active));
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                    margin-left: 0.5rem;
                }

                .nav-right {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }

                .nav-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .nav-section:not(:last-child) {
                    padding-right: 1.5rem;
                    border-right: 1px solid var(--nav-border);
                }

                .nav-right a {
                    text-decoration: none;
                    color: var(--nav-text);
                    font-weight: 500;
                    font-size: 0.95rem;
                    padding: 0.5rem 0.8rem;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .nav-right a:hover {
                    color: var(--nav-active);
                    background: rgba(108, 92, 231, 0.05);
                }

                .nav-right a.active {
                    color: var(--nav-active);
                    background: rgba(108, 92, 231, 0.08);
                    font-weight: 600;
                }

                /* Mail 按钮 */
                .nav-contact {
                    position: relative;
                    background: none !important;
                    color: var(--nav-text) !important;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 0.8rem !important;
                    font-weight: 500 !important;
                    border-radius: 6px !important;
                    border: none !important;
                    box-shadow: none !important;
                    transition: all 0.2s ease !important;
                }

                .nav-contact svg {
                    width: 18px;
                    height: 18px;
                    fill: currentColor;
                    transition: transform 0.2s ease;
                }

                .nav-contact:hover {
                    color: var(--nav-active) !important;
                    background: rgba(108, 92, 231, 0.05) !important;
                    transform: translateY(-1px) !important;
                }

                .theme-toggle {
                    background: none;
                    border: none;
                    color: var(--nav-text);
                    cursor: pointer;
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .theme-toggle:hover {
                    background: rgba(108, 92, 231, 0.1);
                    color: var(--nav-active);
                }

                .theme-toggle svg {
                    width: 20px;
                    height: 20px;
                    fill: currentColor;
                }

                .nav-left .artistic-heading {
                    font-size: 1.5rem;
                    text-align: center;
                    padding-left: 1rem;
                    background: linear-gradient(120deg, var(--nav-active), #81ecec);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    text-transform: none;
                    font-family: 'Dancing Script', cursive;
                    position: relative;
                    transition: background 0.3s ease;
                }

                :host-context([data-theme="dark"]) .nav-left .artistic-heading {
                    background: linear-gradient(120deg, var(--nav-active), #a29bfe);
                }


                @media (max-width: 768px) {
                    .nav-content {
                        padding: 0.75rem 1rem;
                    }

                    .nav-right {
                        display: none;
                    }
                }

                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;

        const template = `
            <nav class="navbar">
                <div class="nav-content">
                    <div class="nav-left">
                        <a href="../index.html" class="artistic-heading">Toward a Broader Future</a>
                    </div>
                    <div class="nav-right">
                        <div class="nav-section">
                            <a href="../index.html#profile" class="nav-link">Profile</a>
                            <a href="../index.html#news" class="nav-link">News</a>
                            <a href="../index.html#publications" class="nav-link">Publications</a>
                            <a href="../index.html#awards" class="nav-link">Awards</a>
                        </div>
                        <div class="nav-section">
                            <a href="mailto:mpx0222@qq.com" class="nav-contact">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                                Mail
                            </a>
                            <button class="theme-toggle" id="theme-toggle" title="Toggle Dark Mode">
                                <svg class="sun-icon" viewBox="0 0 24 24" style="display: none;">
                                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                                </svg>
                                <svg class="moon-icon" viewBox="0 0 24 24">
                                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        this.shadowRoot.innerHTML = styles + template;
        this.updateActiveLink();
        this.setupScrollListener();
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const toggleBtn = this.shadowRoot.getElementById('theme-toggle');
        const sunIcon = this.shadowRoot.querySelector('.sun-icon');
        const moonIcon = this.shadowRoot.querySelector('.moon-icon');
        
        // Check for saved theme or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.setTheme(currentTheme);

        toggleBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        const sunIcon = this.shadowRoot.querySelector('.sun-icon');
        const moonIcon = this.shadowRoot.querySelector('.moon-icon');

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    updateActiveLink() {
        const currentPath = window.location.pathname;
        const homeLink = this.shadowRoot.getElementById('home-link');
        const recordsLink = this.shadowRoot.getElementById('records-link');
        const publicationsDetailLink = this.shadowRoot.querySelector('.nav-publications-detail');

        this.shadowRoot.querySelectorAll('.nav-right a').forEach(link => {
            link.classList.remove('active');
        });

        if (currentPath.includes('publications.html')) {
            publicationsDetailLink?.classList.add('active');
        } else if (currentPath.includes('index.html') || currentPath === '/') {
            homeLink?.classList.add('active');
        } else if (currentPath.includes('records.html')) {
            recordsLink?.classList.add('active');
        }
    }

    setupScrollListener() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    this.updateSectionHighlight(id);
                }
            });
        }, { threshold: 0.5 });

        ['profile', 'news', 'publications', 'awards', 'projects'].forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });
    }

    updateSectionHighlight(activeId) {
        const links = this.shadowRoot.querySelectorAll('.nav-right a[href^="#"]');
        links.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

customElements.define('nav-bar', Navbar);
