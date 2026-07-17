// Shared 3D GLB Model Viewer using Babylon.js
let babylonEngine = null;
let babylonScene = null;

function init3DViewer(canvasId, modelUrl) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    function run() {
        // 1. Initialize Babylon Engine
        babylonEngine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

        // 2. Create Scene
        const createScene = function () {
            const scene = new BABYLON.Scene(babylonEngine);
            
            // Create Skybox using SkyMaterial to make the background bright and natural
            const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
            const skyboxMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.inclination = 0; // Noon sun position for bright sky
            skyboxMaterial.luminance = 1.0;
            skybox.infiniteDistance = true;
            skybox.material = skyboxMaterial;

            // Split modelUrl into rootUrl and file name
            const lastSlash = modelUrl.lastIndexOf('/');
            const rootUrl = lastSlash !== -1 ? modelUrl.substring(0, lastSlash + 1) : "";
            const sceneFilename = lastSlash !== -1 ? modelUrl.substring(lastSlash + 1) : modelUrl;

            // Create a temporary camera synchronously so the engine can render immediately while loading the model
            const tempCamera = new BABYLON.ArcRotateCamera("tempCamera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
            scene.activeCamera = tempCamera;

            // 3. Load GLB Model
            BABYLON.SceneLoader.ShowLoadingScreen = true;
            canvas.style.opacity = '0.3';

            BABYLON.SceneLoader.ImportMesh(
                "",
                rootUrl,
                sceneFilename,
                scene,
                function (meshes) {
                    // Model loaded successfully
                    canvas.style.opacity = '1';

                    // Hide loading screen
                    const loadingIndicator = document.getElementById('lightbox-3d-loading');
                    if (loadingIndicator) {
                        loadingIndicator.style.opacity = '0';
                        setTimeout(() => {
                            loadingIndicator.style.display = 'none';
                        }, 500);
                    }

                    // 4. Create Camera & Light optimized for glTF PBR models
                    scene.createDefaultCameraOrLight(true, true, true);

                    // Dispose temporary camera
                    const oldTemp = scene.getCameraByName("tempCamera");
                    if (oldTemp) {
                        oldTemp.dispose();
                    }

                    // 5. Configure the generated Camera
                    const camera = scene.activeCamera;
                    if (camera) {
                        camera.attachControl(canvas, true);
                        camera.alpha = Math.PI; // Start camera rotation from -X axis (looking along +X)
                        camera.useAutoRotationBehavior = true;
                        if (camera.autoRotationBehavior) {
                            camera.autoRotationBehavior.idleRotationSpeed = 0.2;
                        }
                        camera.lowerRadiusLimit = 2;
                        camera.upperRadiusLimit = 150;

                        // Add lightweight Ambient Occlusion (SSAO) to create realistic contact shadows
                        try {
                            const ssao = new BABYLON.SSAORenderingPipeline("ssaoPipeline", scene, 1.0, [camera]);
                            ssao.totalStrength = 1.0;
                            ssao.radius = 0.75;
                        } catch (e) {
                            console.warn("Ambient Occlusion (SSAO) is not supported on this device/browser:", e);
                        }
                    }

                    // 6. Enhance Lighting
                    const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
                        "https://assets.babylonjs.com/environments/environmentSpecular.env",
                        scene
                    );
                    scene.environmentTexture = envTexture;
                    scene.environmentIntensity = 1; // High quality PBR reflections (up from 0.5)

                    // Configure all lights in the scene for a bright, professional look
                    scene.lights.forEach(light => {
                        light.intensity = 1.2; // Up from 0.8
                    });
                },
                function (evt) {
                    // Progress callback (optional)
                },
                function (scene, message, exception) {
                    console.error("Error loading model in Babylon: ", message, exception);

                    // Hide loading screen on error to prevent stuck state
                    const loadingIndicator = document.getElementById('lightbox-3d-loading');
                    if (loadingIndicator) {
                        loadingIndicator.style.opacity = '0';
                        setTimeout(() => {
                            loadingIndicator.style.display = 'none';
                        }, 500);
                    }
                }
            );

            return scene;
        };

        babylonScene = createScene();

        // 7. Run Render Loop
        babylonEngine.runRenderLoop(function () {
            if (babylonScene) {
                babylonScene.render();
            }
        });

        // 8. Handle Resize
        window.addEventListener("resize", onResize);
    }

    if (typeof BABYLON.SkyMaterial === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js";
        script.onload = run;
        document.head.appendChild(script);
    } else {
        run();
    }
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
