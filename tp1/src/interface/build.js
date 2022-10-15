export function buildInterface(ui, scene) {
    buildLightsFolder(ui, scene);


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

function switchLight(scene, key, index) {
    const light = scene.lights[index];
    if (scene.enabledLights[key]) {
        light.setVisible(true);
        light.enable();
    } else {
        light.setVisible(false);
        light.disable();
    }
    light.update();
}