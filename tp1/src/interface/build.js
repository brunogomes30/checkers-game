import { switchLight } from '../controllers/lights.js'
import { switchCamera } from '../controllers/cameras.js'

export function buildInterface(ui, scene) {
    buildCameraSelector(ui, scene);
    buildLightsFolder(ui, scene);
    buildDebugFolder(ui, scene);
}

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



function buildCameraSelector(ui, scene) {
    ui.gui.add(ui, 'activeCameraId', Object.keys(scene.cameras)).name('Cameras').onChange(() => switchCamera(ui, scene, ui.activeCameraId))
}

function buildDebugFolder(ui, scene) {
    let folder = ui.gui.addFolder("Debug");
    folder.add(scene, 'setLightsVisible').name('Set Cameras visible').onChange(() => {
        for (let i = 0; i < 8; i++) {
            scene.lights[i].setVisible(scene.setLightsVisible);
        }
    });

    folder.add(scene, 'displayNormals').name("Display normals").onChange(()=>{
        scene.graph.primitives.forEach((primitive)=>{
            if (scene.displayNormals){
                primitive.enableNormalViz();
            }
            else{
                primitive.disableNormalViz();
            }
        })
    })
}


