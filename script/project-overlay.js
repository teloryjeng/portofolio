document.addEventListener('DOMContentLoaded', () => {
    // Helper to detect low-spec or slow network devices
    function isLowSpecDevice() {
        // Detect slow network connection or Data Saver enabled
        if (navigator.connection) {
            if (navigator.connection.saveData) return true;
            const slowConnections = ['slow-2g', '2g', '3g'];
            if (slowConnections.includes(navigator.connection.effectiveType)) return true;
        }
        if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
        return false;
    }

    // Helper to play SFX dynamically
    function playSfx(sfxName) {
        if (isLowSpecDevice()) return;
        const isSubfolder = window.location.pathname.includes("/projects/");
        const prefix = isSubfolder ? "../" : "./";
        const audio = new Audio(`${prefix}assets/sfx/${sfxName}`);
        audio.playbackRate = 0.9 + Math.random() * 0.2; // Slight organic pitch variation
        audio.play().catch(err => {
            console.log("SFX autoplay blocked:", err);
        });
    }

    // 1. Mobile Warning & Performance Safeguard
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
    const mvs = document.querySelectorAll('model-viewer');

    if (isMobile) {
        // Instantly remove src to block heavy 3D asset downloads before consent
        mvs.forEach(mv => {
            mv.dataset.src = mv.getAttribute('src');
            mv.removeAttribute('src');
        });

        // Dynamically create mobile warning overlay HTML
        let warningOverlay = document.getElementById('p5-mobile-warning');
        if (!warningOverlay) {
            warningOverlay = document.createElement('div');
            warningOverlay.id = 'p5-mobile-warning';
            warningOverlay.className = 'p5-warning-overlay';
            warningOverlay.innerHTML = `
                <div class="p5-warning-box">
                    <div class="p5-warning-accent">WARNING!</div>
                    <h2 class="p5-warning-title">BEBAN DATA SANGAT BERAT</h2>
                    <p class="p5-warning-desc">
                        Halaman ini memuat model 3D interaktif berukuran <strong>BESAR</strong>.
                        Browser handphone Anda dapat mengalami force close (crash) karena keterbatasan memori RAM.
                    </p>
                    <p class="p5-warning-suggestion">
                        Disarankan untuk membuka halaman ini melalui <strong>Browser PC/Laptop</strong> untuk performa optimal.
                    </p>
                    <div class="p5-warning-buttons">
                        <button id="p5-warning-proceed" class="p5-warn-btn btn-proceed">LANJUTKAN SAJA</button>
                        <button id="p5-warning-back" class="p5-warn-btn btn-back">KEMBALI</button>
                    </div>
                </div>
            `;
            document.body.appendChild(warningOverlay);
        }

        warningOverlay.classList.add('active');

        // Play warning sound effect
        playSfx("persona-5-notification.mp3");

        const proceedBtn = document.getElementById('p5-warning-proceed');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                warningOverlay.classList.remove('active');
                // Restore src to download assets
                mvs.forEach(mv => {
                    if (mv.dataset.src) {
                        mv.setAttribute('src', mv.dataset.src);
                    }
                });
                // Trigger the end of the transition overlay
                if (typeof window.endP5Transition === 'function') {
                    window.endP5Transition();
                }
            });
        }

        const backBtn = document.getElementById('p5-warning-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // Navigate back or to index
                if (document.referrer) {
                    window.location.href = document.referrer;
                } else {
                    const isSubfolder = window.location.pathname.includes("/projects/");
                    window.location.href = isSubfolder ? '../index.html' : './index.html';
                }
            });
        }
    }

    // 2. Create lightbox elements dynamically
    const lightbox = document.createElement('div');
    lightbox.id = 'p5-lightbox';

    lightbox.innerHTML = `
        <div class="lightbox-wrapper">
            <div class="lightbox-close">&times;</div>
            <div id="lightbox-3d-loading" class="mv-loading-poster" style="display: none;">
                <div class="mv-loading-spinner"></div>
                <span class="mv-loading-text">LOADING 3D SCENE</span>
            </div>
            <img class="lightbox-content" src="" alt="">
        </div>
        <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    // 3. Select all wrappers to be previewed
    const wrappers = document.querySelectorAll('.gallery-item, .story-image-wrapper, .story-video-wrapper');

    wrappers.forEach(wrapper => {
        // Skip the ets2/general logos and any interactive iframe wrappers
        if (wrapper.classList.contains('no-border') || wrapper.querySelector('iframe')) return;

        // Set cursor pointer to indicate clickability
        wrapper.style.cursor = 'pointer';

        wrapper.addEventListener('click', () => {
            const is3D = wrapper.classList.contains('gallery-item');

            if (is3D) {
                // 3D Model Preview
                if (lightboxImg) lightboxImg.style.display = 'none';

                // Show loading indicator
                const loadingIndicator = lightbox.querySelector('#lightbox-3d-loading');
                if (loadingIndicator) {
                    loadingIndicator.style.opacity = '1';
                    loadingIndicator.style.display = 'flex';
                }

                let canvas = lightbox.querySelector('#lightbox-3d-canvas');
                if (!canvas) {
                    canvas = document.createElement('canvas');
                    canvas.id = 'lightbox-3d-canvas';
                    canvas.className = 'lightbox-content';
                    canvas.style.width = 'clamp(280px, 75vw, 850px)';
                    canvas.style.height = 'clamp(350px, 60vh, 550px)';
                    const wrapperDiv = lightbox.querySelector('.lightbox-wrapper');
                    if (wrapperDiv) {
                        wrapperDiv.appendChild(canvas);
                    }
                }
                canvas.style.display = 'block';

                const mvElement = wrapper.querySelector('model-viewer');
                const modelUrl = mvElement ? (mvElement.getAttribute('src') || mvElement.dataset.src) : '';
                const altText = mvElement ? mvElement.getAttribute('alt') : 'INTERACTIVE 3D MODEL';

                if (lightboxCaption) {
                    lightboxCaption.innerText = altText.toUpperCase();
                }

                // Show lightbox
                lightbox.classList.add('active');
                playSfx("deck_ui_show_modal.wav");
                document.body.classList.add('p5-transition-active');

                // Initialize Babylon 3D after a short delay to ensure DOM layout is complete
                setTimeout(() => {
                    if (typeof init3DViewer === 'function' && modelUrl) {
                        init3DViewer('lightbox-3d-canvas', modelUrl);
                    }
                }, 100);
            } else {
                // Static Image Preview
                const canvas = lightbox.querySelector('#lightbox-3d-canvas');
                if (canvas) canvas.style.display = 'none';
                if (lightboxImg) lightboxImg.style.display = 'block';

                const img = wrapper.querySelector('img');
                if (!img) return;

                if (lightboxImg) {
                    lightboxImg.src = img.src;
                    lightboxImg.alt = img.alt;
                }
                if (lightboxCaption) {
                    lightboxCaption.innerText = img.alt || 'PREVIEW IMAGE';
                }

                // Show lightbox
                lightbox.classList.add('active');
                playSfx("deck_ui_show_modal.wav");
                document.body.classList.add('p5-transition-active');
            }
        });
    });

    // 4. Close functions
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        playSfx("deck_ui_switch_toggle_off.wav");
        document.body.classList.remove('p5-transition-active');

        // Dispose 3D viewer to free memory
        if (typeof dispose3DViewer === 'function') {
            dispose3DViewer();
        }

        // Clean up canvas
        const canvas = lightbox.querySelector('#lightbox-3d-canvas');
        if (canvas) canvas.remove();
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close when clicking background outside the wrapper
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
