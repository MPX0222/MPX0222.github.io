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

                /* 现代化按钮样式 */
                .nav-right a#home-link,
                .nav-right a#records-link {
                    position: relative;
                    font-weight: 600;
                    color: #6c5ce7;
                    background: rgba(108, 92, 231, 0.08);
                    border: 2px solid rgba(108, 92, 231, 0.2);
                    border-radius: 12px;
                    padding: 0.6rem 1.2rem !important;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);
                }

                .nav-right a#home-link::before,
                .nav-right a#records-link::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                }

                .nav-right a#home-link:hover,
                .nav-right a#records-link:hover {
                    border-color: #6c5ce7;
                    background: rgba(108, 92, 231, 0.12);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(108, 92, 231, 0.2);
                }

                .nav-right a#home-link:hover::before,
                .nav-right a#records-link:hover::before {
                    left: 100%;
                }

                .nav-right a#home-link.active,
                .nav-right a#records-link.active {
                    background: linear-gradient(135deg, #2d3436, #6c5ce7);
                    color: white;
                    border-color: #6c5ce7;
                    box-shadow: 0 4px 16px rgba(108, 92, 231, 0.3);
                    transform: translateY(-1px);
                }

                .nav-contact {
                    position: relative;
                    background: linear-gradient(135deg, #2d3436, #6c5ce7) !important;
                    color: white !important;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.6rem 1.4rem !important;
                    font-weight: 600 !important;
                    border-radius: 50px !important;
                    border: none !important;
                    box-shadow: 0 4px 15px rgba(108, 92, 231, 0.2) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    overflow: hidden;
                }

                .nav-contact::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
                    transition: left 0.5s ease;
                }

                .nav-contact svg {
                    width: 18px;
                    height: 18px;
                    fill: currentColor;
                    transition: transform 0.3s ease;
                }
                
                .nav-contact:hover {
                    transform: translateY(-3px) !important;
                    box-shadow: 0 8px 25px rgba(108, 92, 231, 0.35) !important;
                    background: linear-gradient(135deg, #3d4466, #7c6ce7) !important;
                }

                .nav-contact:hover::before {
                    left: 100%;
                }

                .nav-contact:hover svg {
                    transform: scale(1.1);
                }

                .nav-contact:active {
                    transform: translateY(-1px) !important;
                    transition: all 0.1s ease !important;
                }

                .nav-left .artistic-heading {
                    font-size: 1.5rem;
                    text-align: center;
                    padding-left: 1rem;
                    background: linear-gradient(120deg, #6c5ce7, #81ecec);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    text-transform: none;
                    font-family: 'Dancing Script', cursive;
                    position: relative;
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
                        <a class="artistic-heading">Toward a Broader Future</a>
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