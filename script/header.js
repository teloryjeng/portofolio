// Header Navigation Component
(function () {
    const currentPath = window.location.pathname;
    const isAboutPage = currentPath.includes("about.html");
    const isProjectPage = currentPath.includes("project.html");
    const isSubfolder = currentPath.includes("/projects/");
    const prefix = isSubfolder ? "../" : "./";

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
                <a href="${prefix}index.html#photography" class="nav-link">PHOTOGRAPHY SIDE</a>
            </nav>
            <div class="header-spacer"></div>
        </header>
    `);
})();
