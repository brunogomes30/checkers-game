import { switchLight } from '../controllers/lights.js'
import { switchCamera } from '../controllers/cameras.js'

/**
 * Builds the scene's UI
 * @typedef {dat.UI} ui
 * @typedef {MySceneGraph} scene
 */
export function buildInterface(ui, scene) {
    buildCameraSelector(ui, scene);
    buildLightsFolder(ui, scene);
    buildHighligthsFolder(ui, scene);
    buildDebugFolder(ui, scene);
}

/**
 * Builds the lights folder in the UI with the given scene 
 * with the functionality to enable/disable each light
 * @param {dat.GUI} gui
 * @param {MySceneGraph} scene
 */
function buildLightsFolder(ui, scene) {
    const lights = scene.graph.lights;
    const lightsFolder = ui.gui.addFolder("Lights");
    Object.keys(lights).forEach(function (key, index) {
        lightsFolder.add(scene.enabledLights, key).name(key).onChange(
            function () {
                switchLight(scene, key, index);
            }
        );
    });
}

/**
* Builds the highligths folder in the UI with the given scene
* with the functionality to enable/disable each highligth
* @param {dat.GUI} gui
* @param {MySceneGraph} scene
*/
function buildHighligthsFolder(ui, scene) {
    const folder = ui.gui.addFolder("Highlights");
    Object.keys( scene.highlightedComponents).forEach(function (key, value) {
        folder.add(scene.highlightedComponents, key).name(key).onChange(
            function () {
                const component = scene.graph.components[key];
                component.highlight.isActive = scene.highlightedComponents[key];
            }
        );
    });
    
}

/**
 * Builds the camera selector in the UI with the given scene
 * @param {dat.GUI} gui
 * @param {MySceneGraph} scene
 */
function buildCameraSelector(ui, scene) {
    ui.gui.add(ui, 'activeCameraId', Object.keys(scene.cameras)).name('Cameras').onChange(() => switchCamera(ui, scene, ui.activeCameraId))
}

/**
 * Builds the debug folder in the UI with the given scene
 * @param {dat.GUI} gui
 * @param {MySceneGraph} scene
 */
function buildDebugFolder(ui, scene) {
    let folder = ui.gui.addFolder("Debug");
    folder.add(scene, 'displayAxis').name("Display axis");

    folder.add(scene, 'displayNormals').name("Display normals").onChange(() => {
        scene.graph.primitives.forEach((primitive) => {
            if (scene.displayNormals) {
                primitive.enableNormalViz();
            }
            else {
                primitive.disableNormalViz();
            }
        })
    })

    // Add animations loop controller
    folder.add(scene, 'isLooping').name('Loop animations');


    folder.add(scene, 'setLightsVisible').name('Display lights').onChange(() => {
        for (let i = 0; i < 8; i++) {
            scene.lights[i].setVisible(scene.setLightsVisible);
        }
    });
}
