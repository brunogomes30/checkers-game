
/**
 * Switches the active camera
 * @export
 * @param {dat.UI} ui
 * @param {XMLscene} scene
 * @param {string} cameraId
 */
export function switchCamera(ui, scene, cameraId) {
    let camera = scene.cameras[cameraId]
    ui.setActiveCamera(camera)
    scene.camera = camera
}
