// Header Navigation Component
(function () {
    const currentPath = window.location.pathname;
    const isAboutPage = currentPath.includes("about.html");
    const isProjectPage = currentPath.includes("project.html") || currentPath.includes("/projects/");
    const isPhotographyPage = currentPath.includes("photography.html") || currentPath.includes("/photography/");
    const isSubfolder = currentPath.includes("/projects/") || currentPath.includes("/photography/");
    const prefix = isSubfolder ? "../" : "./";

    // Helper to generate P5 collage letters for the "LET'S WORK TOGETHER" button
    function generateCollageText(text) {
        const colors = [
            { bg: '#E52E2E', text: '#FFFFFF' }, // Red bg, White text
            { bg: '#000000', text: '#FFFFFF' }, // Black bg, White text
            { bg: '#FFFFFF', text: '#000000' }  // White bg, Black text
        ];

        return text.split('').map((char, idx) => {
            if (char === ' ') {
                return `<span class="p5-btn-space"></span>`;
            }

            // Alternating colors
            const combo = colors[idx % colors.length];
            const rot = (Math.random() * 12 - 6).toFixed(1); // -6deg to 6deg
            const scale = (Math.random() * 0.15 + 0.95).toFixed(2); // 0.95 to 1.10
            const translateY = (Math.random() * 4 - 2).toFixed(1); // -2px to 2px

            return `<span class="p5-btn-letter" style="--rot:${rot}deg; --s:${scale}; --ty:${translateY}px; --bg:${combo.bg}; --fg:${combo.text}">${char}</span>`;
        }).join('');
    }

    const buttonContentHtml = generateCollageText("HIRE  ME");

    document.write(`
        <!-- Persona 5 Transition Overlay -->
        <div id="p5-transition-overlay">
            <div class="p5-slash p5-slash-1"></div>
            <div class="p5-slash p5-slash-2"></div>
            <div class="p5-slash p5-slash-3"></div>
            <div class="p5-slash p5-slash-4"></div>
            <div class="p5-slash p5-bg-cover"></div>
            <div class="p5-loading-container">
                <div class="p5-star-container">
                    <svg class="p5-star" viewBox="0 0 24 24" width="50" height="50">
                        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#E52E2E" stroke="#000000" stroke-width="2"/>
                    </svg>
                </div>
                <div class="p5-loading-text" id="p5-loading-text">LOADING</div>
            </div>
        </div>

        <header class="main-header">
            <div class="logo-container">
                <a href="${prefix}index.html" class="logo-link" aria-label="Home">
                    <span class="logo-wrapper">
                        <img src="${prefix}assets/logo/sdefault.png" alt="Sururi Ardan Logo" class="logo-default">
                        <img src="${prefix}assets/logo/shover.png" alt="Sururi Ardan Logo Hover" class="logo-hover">
                    </span>
                </a>
            </div>
            <nav class="nav-pill">
                <a href="${prefix}about.html" class="nav-link ${isAboutPage ? 'active' : ''}">ABOUT ME</a>
                <a href="${prefix}project.html" class="nav-link ${isProjectPage ? 'active' : ''}">MY PROJECT</a>
                <a href="${prefix}photography.html" class="nav-link ${isPhotographyPage ? 'active' : ''}">PHOTOGRAPHY SIDE</a>
            </nav>
            <div class="header-action-container">
                <a href="mailto:muhsururiardan@gmail.com" class="p5-nav-btn" aria-label="Mail Me">
                    <span class="btn-text">${buttonContentHtml}</span>
                    <span class="btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </span>
                </a>
            </div>
        </header>
    `);
})();
