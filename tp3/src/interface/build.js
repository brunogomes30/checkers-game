import { dat } from '../../../lib/CGF.js'
import { switchLight } from '../controllers/lights.js'
import { switchCamera } from '../controllers/cameras.js'

/**
 * Builds the scene's UI
 * @typedef {dat.UI} ui
 * @typedef {MySceneGraph} scene
 */
export function buildInterface(appUI, graph) {
    let graphUI = appUI.gui.addFolder(graph.name);
    buildCameraSelector(graphUI, appUI, graph);
    buildLightsFolder(graphUI, graph);
    buildHighligthsFolder(graphUI, graph);
    graphUI.hide();
    graph.ui = graphUI;
}

/**
 * Builds the lights folder in the UI with the given scene 
 * with the functionality to enable/disable each light
 * @param {dat.GUI} gui
 * @param {MySceneGraph} scene
 */
function buildLightsFolder(ui, graph) {
    const lights = graph.lights;
    const lightsFolder = ui.addFolder("Lights");
    Object.keys(lights).forEach(function (key, index) {
        lightsFolder.add(graph.enabledLights, key).name(key).onChange(
            function () {
                switchLight(graph.scene, key, index);
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
function buildHighligthsFolder(ui, graph) {
    const folder = ui.addFolder("Highlights");
    Object.keys(graph.highlightedComponents).forEach(function (key, value) {
        folder.add(graph.highlightedComponents, key).name(key).onChange(
            function () {
                const component = graph.components[key];
                component.highlight.isActive = graph.scene.highlightedComponents[key];
            }
        );
    });

}

/**
 * Builds the camera selector in the UI with the given scene
 * @param {dat.GUI} gui
 * @param {MySceneGraph} scene
 */
function buildCameraSelector(ui, appUI, graph) {
    ui.add(graph, 'activeCameraId', Object.keys(graph.cameras)).name('Cameras').onChange(() => switchCamera(appUI, graph.scene, graph.activeCameraId))
}

/**
 * Builds the debug folder in the UI with the given scene
 * @param {dat.GUI} gui
 * @param {MySceneGraph} scene
 */
export function buildDebugFolder(ui, scene) {
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
