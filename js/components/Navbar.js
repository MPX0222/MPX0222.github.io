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
                    font-family: var(--font-family, 'Georama', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                    --primary-color: #1e3799;
                    --primary-light: #4a69bd;
                    --primary-dark: #0c2461;
                    --text-primary: #2f3542;
                    --text-secondary: #57606f;
                }

                .navbar {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(30, 55, 153, 0.08);
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(30, 55, 153, 0.05);
                    opacity: 0;
                    animation: fadeInDown 0.3s ease-out forwards;
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
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .nav-brand svg {
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
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
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
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
                    border-right: 1px solid rgba(74, 105, 189, 0.15);
                }

                .nav-right a {
                    text-decoration: none;
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.95rem;
                    padding: 0.5rem 0.8rem;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .nav-right a:hover {
                    color: var(--primary-color);
                    background: rgba(30, 55, 153, 0.05);
                }

                .nav-right a.active {
                    color: var(--primary-color);
                    background: rgba(30, 55, 153, 0.08);
                    font-weight: 600;
                }

                /* 特殊按钮样式 */
                .nav-right a#home-link,
                .nav-right a#records-link {
                    font-weight: 600;
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    border: 1px solid #6c5ce7;
                }

                .nav-right a#home-link:hover,
                .nav-right a#records-link:hover {
                    opacity: 0.9;
                }

                .nav-right a#home-link.active,
                .nav-right a#records-link.active {
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
                    -webkit-background-clip: none;
                    background-clip: none;
                    -webkit-text-fill-color: white;
                    color: white;
                }

                .nav-contact {
                    background: linear-gradient(135deg, #2d3436, #6c5ce7) !important;
                    color: white !important;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1.2rem !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                }

                .nav-contact svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }
                
                .nav-contact:hover {
                    opacity: 0.9 !important;
                    transform: translateY(-1px) !important;
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
                        <a href="../index.html" class="nav-brand">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L1 12H4V21H20V12H23L12 2Z" fill="currentColor"/>
                            </svg>
                            Academic Profile
                            <span class="version">v3.5</span>
                        </a>
                    </div>
                    <div class="nav-right">
                        <div class="nav-section">
                            <a href="#profile" class="nav-link">Profile</a>
                            <a href="#news" class="nav-link">News</a>
                            <a href="#publications" class="nav-link">Publications</a>
                            <a href="#awards" class="nav-link">Awards</a>
                            <a href="#projects" class="nav-link">Projects</a>
                        </div>
                        <div class="nav-section">
                            <a href="../index.html" id="home-link">Home</a>
                            <a href="../pages/publications.html" class="nav-link" id="records-link">Detailed Publications</a>
                        </div>
                        <div class="nav-section">
                            <a href="mailto:mpx0222@qq.com" class="nav-contact">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                                Mail
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        this.shadowRoot.innerHTML = styles + template;
        this.updateActiveLink();
        this.setupScrollListener();
    }

    updateActiveLink() {
        const currentPath = window.location.pathname;
        const homeLink = this.shadowRoot.getElementById('home-link');
        const recordsLink = this.shadowRoot.getElementById('records-link');

        // 移除所有active类
        homeLink?.classList.remove('active');
        recordsLink?.classList.remove('active');

        // 根据当前路径设置active类
        if (currentPath.includes('publications.html')) {
            recordsLink?.classList.add('active');
        } else if (currentPath.includes('index.html') || currentPath === '/') {
            homeLink?.classList.add('active');
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

        // 观察所有section
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

// 注册自定义元素
customElements.define('nav-bar', Navbar);