export function switchCamera(ui, scene, cameraId) {
    let camera = scene.cameras[cameraId]
    ui.setActiveCamera(camera)
    scene.camera = camera

}