// ATB Raya 3D Model Viewer using Babylon.js
let babylonEngine = null;
let babylonScene = null;

function init3DViewer(canvasId, modelUrl) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // 1. Initialize Babylon Engine
    babylonEngine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

    // 2. Create Scene
    const createScene = function () {
        const scene = new BABYLON.Scene(babylonEngine);
        scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1); // Dark P5 background

        // Split modelUrl into folder (rootUrl) and file name (sceneFilename)
        const lastSlash = modelUrl.lastIndexOf('/');
        const rootUrl = lastSlash !== -1 ? modelUrl.substring(0, lastSlash + 1) : "";
        const sceneFilename = lastSlash !== -1 ? modelUrl.substring(lastSlash + 1) : modelUrl;

        // Create a temporary camera synchronously so the engine can render immediately while loading the model
        const tempCamera = new BABYLON.ArcRotateCamera("tempCamera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
        scene.activeCamera = tempCamera;

        // 3. Load GLB Model using ImportMesh
        BABYLON.SceneLoader.ShowLoadingScreen = true;
        canvas.style.opacity = '0.3';

        BABYLON.SceneLoader.ImportMesh(
            "",
            rootUrl,
            sceneFilename,
            scene,
            function (meshes) {
                // Model Loaded successfully!
                canvas.style.opacity = '1';

                // Hide loading screen with a smooth fade-out
                const loadingIndicator = document.getElementById('lightbox-3d-loading');
                if (loadingIndicator) {
                    loadingIndicator.style.opacity = '0';
                    setTimeout(() => {
                        loadingIndicator.style.display = 'none';
                    }, 500);
                }

                // 4. Use Babylon's helper to create Camera & Light optimized for glTF PBR models
                scene.createDefaultCameraOrLight(true, true, true);

                // Dispose temporary camera since we now have the framed camera
                const oldTemp = scene.getCameraByName("tempCamera");
                if (oldTemp) {
                    oldTemp.dispose();
                }

                // 5. Configure the generated Camera
                const camera = scene.activeCamera;
                if (camera) {
                    camera.attachControl(canvas, true);
                    camera.useAutoRotationBehavior = true;
                    
                    // Set auto rotation speed
                    if (camera.autoRotationBehavior) {
                        camera.autoRotationBehavior.idleRotationSpeed = 0.2; // Smooth auto rotation
                    }

                    // Add zoom limits
                    camera.lowerRadiusLimit = 2;
                    camera.upperRadiusLimit = 150;
                }

                // 6. Enhance Lighting to simulate Blender Eevee physical engine
                // Load high-quality prefitered environment texture from Babylon CDN for realistic PBR reflections
                const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
                    "https://assets.babylonjs.com/environments/environmentSpecular.env", 
                    scene
                );
                scene.environmentTexture = envTexture;
                scene.environmentIntensity = 2.5; // Strong ambient specular reflections (Eevee style)

                // Configure dedicated direct sunlight DirectionalLight
                let sunLight = scene.getLightByName("sunLight");
                if (!sunLight) {
                    sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(-1, -2.5, -1).normalize(), scene);
                }
                sunLight.intensity = 4.0; // Strong sunlight
                sunLight.diffuse = new BABYLON.Color3(1.0, 0.98, 0.93); // Warm sun light

                // Configure sky fill HemisphericLight
                let skyLight = scene.getLightByName("skyLight");
                if (!skyLight) {
                    skyLight = new BABYLON.HemisphericLight("skyLight", new BABYLON.Vector3(0, 1, 0), scene);
                }
                skyLight.intensity = 1.8;
                skyLight.diffuse = new BABYLON.Color3(0.9, 0.95, 1.0); // Soft sky blue reflection
                skyLight.groundColor = new BABYLON.Color3(0.25, 0.25, 0.25);

                // Enable professional Tone Mapping and Sunny Exposure
                scene.imageProcessingConfiguration.toneMappingEnabled = true;
                scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
                scene.imageProcessingConfiguration.exposure = 1.8; // Bright Eevee exposure boost
            },
            function (evt) {
                // Loading progress
            },
            function (sceneError, message) {
                console.error("Failed to load 3D Model:", message);
                canvas.style.opacity = '1';

                // Hide loading screen instantly on error
                const loadingIndicator = document.getElementById('lightbox-3d-loading');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }

                // Show a helpful error message on screen (often CORS file:// protocol issue)
                const caption = document.querySelector('.lightbox-caption');
                if (caption) {
                    caption.innerHTML = "Gagal memuat 3D Model. <br><small style='color: #E52E2E; font-size: 0.9rem;'>Gunakan Web Server lokal (seperti VS Code Live Server) untuk menghindari proteksi browser CORS (file://).</small>";
                }
            }
        );

        return scene;
    };

    babylonScene = createScene();

    // 7. Run Render Loop
    babylonEngine.runRenderLoop(function () {
        if (babylonScene && babylonScene.activeCamera) {
            babylonScene.render();
        }
    });

    // 8. Handle Resize
    window.addEventListener("resize", onResize);
}

function onResize() {
    if (babylonEngine) {
        babylonEngine.resize();
    }
}

function dispose3DViewer() {
    window.removeEventListener("resize", onResize);

    if (babylonScene) {
        babylonScene.dispose();
        babylonScene = null;
    }
    if (babylonEngine) {
        babylonEngine.dispose();
        babylonEngine = null;
    }
}
