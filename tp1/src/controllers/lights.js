export function switchLight(scene, key, index) {
    const light = scene.lights[index];
    if (scene.enabledLights[key]) {
        light.enable();
    } else {
        light.disable();
    }
}