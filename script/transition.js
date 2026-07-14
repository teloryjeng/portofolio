// Persona 5 Page Transition Handler
(function () {

    let overlayInjected = false;
    const startTime = Date.now();
    const minLoadDuration = 600; // Minimum time (ms) to show transition for visual satisfaction

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

    // Cache for Web Audio API to bypass IDM interception
    let audioCtx = null;
    const audioBuffers = {};

    // Helper to play SFX dynamically using Web Audio API to bypass IDM
    function playSfx(sfxName) {
        if (isLowSpecDevice()) return;
        
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const isSubfolder = window.location.pathname.includes("/projects/");
            const prefix = isSubfolder ? "../" : "./";
            const url = `${prefix}assets/sfx/${sfxName}`;

            if (audioBuffers[url]) {
                playBuffer(audioBuffers[url]);
            } else {
                fetch(url)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        audioBuffers[url] = audioBuffer;
                        playBuffer(audioBuffer);
                    })
                    .catch(err => console.log("Audio fetch/decode failed:", err));
            }
        } catch (e) {
            console.log("Web Audio API not supported, falling back:", e);
            // Fallback to standard Audio if Web Audio API fails
            const isSubfolder = window.location.pathname.includes("/projects/");
            const prefix = isSubfolder ? "../" : "./";
            const audio = new Audio(`${prefix}assets/sfx/${sfxName}`);
            audio.play().catch(err => console.log("Fallback SFX blocked:", err));
        }

        function playBuffer(buffer) {
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
        }
    }

    // 1. Generate Cutout Letters dynamically
    function initLetters() {
        const textContainer = document.getElementById('p5-loading-text');
        if (!textContainer) return;

        const text = "LOADING";
        // Classic Persona 5 color combos (bg & text)
        const p5Colors = [
            { bg: '#E52E2E', text: '#FFFFFF' }, // Red bg, White text
            { bg: '#000000', text: '#FFFFFF' }, // Black bg, White text
            { bg: '#FFFFFF', text: '#000000' }, // White bg, Black text
            { bg: '#000000', text: '#E52E2E' }  // Black bg, Red text
        ];

        textContainer.innerHTML = ''; // Clear fallback text if any

        text.split('').forEach((char, idx) => {
            if (char === ' ') {
                const space = document.createElement('span');
                space.className = 'p5-space';
                textContainer.appendChild(space);
                return;
            }

            const span = document.createElement('span');
            span.className = 'p5-letter';
            span.innerText = char;

            // Pick a random color combination
            const colorCombo = p5Colors[Math.floor(Math.random() * p5Colors.length)];
            span.style.backgroundColor = colorCombo.bg;
            span.style.color = colorCombo.text;

            // Generate slight tilts and scales for the collage look
            const rot = (Math.random() * 18 - 9).toFixed(1); // -9deg to 9deg
            const scale = (Math.random() * 0.25 + 0.9).toFixed(2); // 0.9 to 1.15
            const translateY = (Math.random() * 8 - 4).toFixed(1); // -4px to 4px

            // Set CSS Custom Properties for jitter keyframes
            span.style.setProperty('--rot', `${rot}deg`);
            span.style.setProperty('--s', scale);
            span.style.setProperty('--ty', `${translateY}px`);

            // Jagged custom clip-path polygon to simulate hand-cut paper
            const p1 = (Math.random() * 7).toFixed(1);
            const p2 = (Math.random() * 7).toFixed(1);
            const p3 = (93 + Math.random() * 7).toFixed(1);
            const p4 = (Math.random() * 7).toFixed(1);
            const p5 = (93 + Math.random() * 7).toFixed(1);
            const p6 = (93 + Math.random() * 7).toFixed(1);
            const p7 = (Math.random() * 7).toFixed(1);
            const p8 = (93 + Math.random() * 7).toFixed(1);
            span.style.clipPath = `polygon(${p1}% ${p2}%, ${p3}% ${p4}%, ${p5}% ${p6}%, ${p7}% ${p8}%)`;

            // Slightly randomize font sizes for character variety
            span.style.fontSize = `${(Math.random() * 0.4 + 1.8).toFixed(2)}rem`;

            // Stagger animation delays for a non-synchronized choppy look
            span.style.animationDelay = `${(Math.random() * 0.3).toFixed(2)}s`;

            textContainer.appendChild(span);
        });
    }

    // 2. Remove Transition (Intro transition on page load)
    function endTransition() {
        const overlay = document.getElementById('p5-transition-overlay');
        if (!overlay) {
            if (document.body) document.body.classList.remove('p5-transition-active');
            return;
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadDuration - elapsedTime);

        // Ensure transition stays visible for at least minLoadDuration to look amazing
        setTimeout(() => {
            overlay.classList.add('p5-loaded');

            // Play exit transition sound effect
            const exitSfxs = [
                "deck_ui_side_menu_fly_out.dat",
                "deck_ui_hide_modal.dat"
            ];
            const selectedExit = exitSfxs[Math.floor(Math.random() * exitSfxs.length)];
            playSfx(selectedExit);

            // Restore scrolling
            if (document.body) document.body.classList.remove('p5-transition-active');
        }, remainingTime);
    }

    // 3. Setup link interception for exit transitions
    function setupLinkInterception() {
        document.addEventListener('click', function (e) {
            // Find closest anchor tag
            const anchor = e.target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Ignore external links, mailto/tel, javascript links, and open-in-new-tab
            const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
            const isSpecial = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:');
            const isBlank = anchor.getAttribute('target') === '_blank';
            const isHashOnly = href.startsWith('#');

            if (isExternal || isSpecial || isBlank || isHashOnly) {
                return;
            }

            // Parse URL to check pathnames for same-page hash jump prevention
            try {
                const targetUrl = new URL(anchor.href, window.location.origin);
                const currentUrl = new URL(window.location.href);

                // Helper to normalize pathnames (e.g. treat / and /index.html as the same)
                const getNormalizedPath = (url) => {
                    let pathname = url.pathname;
                    if (pathname.endsWith('/')) {
                        pathname += 'index.html';
                    }
                    return pathname;
                };

                const targetPath = getNormalizedPath(targetUrl);
                const currentPath = getNormalizedPath(currentUrl);

                // If same page and has hash target, do not intercept (let smooth scroll script handle it)
                if (targetPath === currentPath && targetUrl.hash) {
                    return;
                }
            } catch (err) {
                // Fail-safe, just let default navigation proceed if parsing errors
                return;
            }

            // Play transition
            e.preventDefault();
            const overlay = document.getElementById('p5-transition-overlay');
            if (overlay) {
                // Block scrolling during transition
                if (document.body) document.body.classList.add('p5-transition-active');

                overlay.classList.remove('p5-loaded');

                // Play entrance transition sound effect
                const entranceSfxs = [
                    "deck_ui_side_menu_fly_in.dat",
                    "deck_ui_launch_game.dat",
                    "deck_ui_default_activation.dat"
                ];
                const selectedEntrance = entranceSfxs[Math.floor(Math.random() * entranceSfxs.length)];
                playSfx(selectedEntrance);

                // Navigate to the target page after the slashes finish sliding in
                setTimeout(() => {
                    window.location.href = href;
                }, 750);
            } else {
                window.location.href = href;
            }
        });
    }

    // Listen to pageshow to handle bfcache (back-forward cache) restores when navigating back
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            const overlay = document.getElementById('p5-transition-overlay');
            if (overlay) {
                overlay.classList.add('p5-loaded');
            }
            if (document.body) {
                document.body.classList.remove('p5-transition-active');
            }
        }
    });

    // Initializer
    function init() {
        if (document.body) {
            document.body.classList.add('p5-transition-active');
        }
        initLetters();
        setupLinkInterception();

        // Expose endTransition globally so other scripts can control it
        window.endP5Transition = endTransition;

        // Check if we need to show the mobile warning overlay (active on pages with 3D model-viewer)
        const hasMobileWarning = document.querySelector('model-viewer') && (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024
        );

        // If warning overlay is shown, let it end the transition later
        if (hasMobileWarning) {
            return;
        }

        // Wait for page resources to load fully before sliding out transition
        if (document.readyState === 'complete') {
            endTransition();
        } else {
            window.addEventListener('load', endTransition);
        }
    }

    // Run as early as possible once DOM has the loading elements
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
