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
                    font-family: var(--font-family, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                }

                .navbar {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
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
                    font-weight: 600;
                    font-size: 1.25rem;
                    color: var(--text-color, #2d3436);
                    text-decoration: none;
                }

                .version {
                    font-size: 0.8rem;
                    font-weight: 400;
                    color: #636e72;
                    margin-bottom: -0.3rem;
                    margin-left: 0.5rem;
                }

                .nav-right {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                }

                .nav-right a {
                    text-decoration: none;
                    color: var(--text-color, #2d3436);
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: color 0.3s ease;
                }

                .nav-right a:hover {
                    color: var(--primary-color, #6c5ce7);
                }

                .nav-right a.active {
                    color: var(--primary-color, #6c5ce7);
                    position: relative;
                }

                .nav-right a.active::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--primary-color, #6c5ce7);
                }

                .nav-contact {
                    padding: 0.5rem 1rem;
                    background: var(--primary-color, #6c5ce7);
                    color: white !important;
                    border-radius: 8px;
                }

                .nav-contact:hover {
                    opacity: 0.9;
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
                        <a href="../index.html" class="nav-brand">Academic Profile</a>
                        <span class="version">Version 3.2</span>
                    </div>
                    <div class="nav-right">
                        <a href="../index.html" id="home-link">Home</a>
                        <a href="../pages/records.html" id="records-link">Records</a>
                        <a href="https://mpx0222.github.io/" class="nav-contact">Contact</a>
                    </div>
                </div>
            </nav>
        `;

        this.shadowRoot.innerHTML = styles + template;
        this.updateActiveLink();
    }

    updateActiveLink() {
        const currentPath = window.location.pathname;
        const homeLink = this.shadowRoot.getElementById('home-link');
        const recordsLink = this.shadowRoot.getElementById('records-link');

        // 移除所有active类
        homeLink.classList.remove('active');
        recordsLink.classList.remove('active');

        // 根据当前路径设置active类
        if (currentPath.includes('records.html')) {
            recordsLink.classList.add('active');
        } else if (currentPath.includes('index.html') || currentPath === '/') {
            homeLink.classList.add('active');
        }
    }
}

// 注册自定义元素
customElements.define('nav-bar', Navbar); 