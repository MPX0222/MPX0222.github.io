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

                /* 创建一个特殊的按钮组，减小这三个按钮之间的间距 */
                .nav-right a#home-link,
                .nav-right a#records-link,
                .nav-right a.nav-contact {
                    margin-left: -0.5rem;
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
                /* 为 Home 和 Records 按钮添加特殊样式 */
                .nav-right a#home-link,
                .nav-right a#records-link {
                    background-color: rgba(108, 92, 231, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 600;
                }
                .nav-right a#home-link:hover,
                .nav-right a#records-link:hover {
                    background-color: rgba(108, 92, 231, 0.2);
                }
                .nav-right a#home-link.active,
                .nav-right a#records-link.active {
                    background-color: var(--primary-color, #6c5ce7);
                    color: white;
                }
                .nav-right a#home-link.active::after,
                .nav-right a#records-link.active::after {
                    display: none;
                }
                .nav-contact {
                    padding: 0.5rem 1rem;
                    background: var(--primary-color, #6c5ce7);
                    color: white !important;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .nav-contact svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }
                
                .nav-contact:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
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
                        <span class="version">Version 3.3</span>
                    </div>
                    <div class="nav-right">
                        <a href="#profile">Profile</a>
                        <a href="#news">News</a>
                        <a href="#publications">Publications</a>
                        <a href="#awards">Awards</a>
                        <a href="#projects">Projects</a>
                        <a href="../index.html" id="home-link">Home</a>
                        <a href="../pages/records.html" id="records-link" class="nav-records">Records</a>
                        <a href="mailto:mpx0222@qq.com" class="nav-contact">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            Mail
                        </a>
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