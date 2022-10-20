import { XMLscene } from "../XMLscene.js";

/**
 * Switches the light on or off depending on the current state of the light
 * @export
 * @param {XMLscene} scene
 * @param {string} key
 * @param {string} index
 */
export function switchLight(scene, key, index) {
    const light = scene.lights[index];
    if (scene.enabledLights[key]) {
        light.enable();
    } else {
        light.disable();
    }
}