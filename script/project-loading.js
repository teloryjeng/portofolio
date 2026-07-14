document.addEventListener('DOMContentLoaded', () => {
    // Dynamically inject the loading poster/spinner into all model-viewer elements
    const modelViewers = document.querySelectorAll('model-viewer');
    modelViewers.forEach(mv => {
        if (!mv.querySelector('[slot="poster"]')) {
            const poster = document.createElement('div');
            poster.setAttribute('slot', 'poster');
            poster.className = 'mv-loading-poster';
            poster.innerHTML = `
                <div class="mv-loading-spinner"></div>
                <span class="mv-loading-text">LOADING</span>
            `;
            mv.appendChild(poster);
        }
    });
});
