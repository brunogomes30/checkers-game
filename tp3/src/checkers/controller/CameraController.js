import { CGFcameraAxisID } from "../../../../lib/CGF.js";

export class CameraController {
    constructor(scene, boardController) {
        this.scene = scene;
        this.boardController = boardController;
        this.scene.addEvent('update', (args) => this.update(args));
        this.camera = undefined;
    }

    setCamera(graph) {
        const camera = graph.getCamera('board-camera')
        const board = graph.getComponent('board');
        if (camera && board) {
            console.log(board.getPosition());
            let newPos = vec4.create();
            camera.setPosition(vec4.add(newPos, [...board.getPosition(), 0], camera.position));
            let newTarget = vec4.create();
            camera.setTarget(vec4.add(newTarget, [...board.getPosition(), 0], camera.target));
            this.camera = camera;
            this.camera._up = vec3.fromValues(0, 1, 0);

            this.previousCameraConfiguration = { position: [...camera.position], target: [...camera.target], up: camera._up };
        }
    }


    resetCamera(duration, callback = null) {
        if (this.camera) {
            if (duration == 0) {
                this.camera.setPosition(this.previousCameraConfiguration.position);
                this.camera.setTarget(this.previousCameraConfiguration.target);
                this.camera.direction = this.camera.calculateDirection();
                this.camera._up = vec3.fromValues(0, 1, 0);
                return;
            }

            
            if (this.camera.position == this.previousCameraConfiguration.position && this.camera.target == this.previousCameraConfiguration.target){
                callback();
                return;
            }

            this.animationConfiguration = { position: [...this.camera.position], target: [...this.camera.target], up: this.camera._up };
            this.animate = 'reset';
            this.duration = duration;
            this.callback = callback;
        }
    }

    switchSides(duration, callback = null) {
        if (this.camera) {
            if (duration == 0) {
                this.camera.orbit(vec3.fromValues(0, 1, 0), Math.PI);
                return;
            }

            this.animate = 'switch';
            this.duration = duration;
            this.callback = callback;
        }
    }


    update(time) {
        if (this.animate != undefined) {
            if (this.start == undefined) {
                this.start = time;
            }

            let delta = (time - this.start) / this.duration;

            if (this.animate == 'reset') {
                if (delta >= 1) {
                    this.resetCamera(0);

                } else {

                    this.camera.setPosition(vec4.lerp([], this.animationConfiguration.position, this.previousCameraConfiguration.position, delta));
                    this.camera.setTarget(vec4.lerp([], this.animationConfiguration.target, this.previousCameraConfiguration.target, delta));
                    this.camera.direction = this.camera.calculateDirection();
                    this.camera._up = vec3.lerp(vec3.create(), this.animationConfiguration.up, vec3.fromValues(0, 1, 0), delta);
                }
            }


            if (this.animate == 'switch') {
                if (delta >= 1) {
                    this.resetCamera(0);
                    this.switchSides(0);
                    this.previousCameraConfiguration = { position: [...this.camera.position], target: [...this.camera.target] };

                } else {
                    rotateCamera(this, vec3.fromValues(0, 1, 0), Math.PI, this.duration, time - this.start)
                }
            }

            if (delta >= 1) {
                this.animate = undefined;
                this.duration = undefined;
                this.start = undefined;
                this.animationConfiguration = undefined;
                if (this.callback != null){
                    this.callback();
                }
                
                this.callback = null;
                return;
            }
        }


    }

}

function rotateCamera(cameraController, axisID, angle, duration, elapsedTime) {
    angle = (angle / duration) * elapsedTime;
    //get current look vector reversed.
    var revLook = vec4.sub(vec4.create(), cameraController.previousCameraConfiguration.position, cameraController.previousCameraConfiguration.target);
    revLook[3] = 0;

    //get rotated reversed look vector by the correct angle/axis (if rotating "horizontally", do it around up vector, if "vertically", around normal to look and up vector)
    var rotRevLook;

    if (axisID == CGFcameraAxisID.X) {
        var rotAxis = vec3.create();
        vec3.normalize(rotAxis, vec3.cross(rotAxis, revLook, cameraController.camera._up));
        var rotMatrix = mat4.rotate(mat4.create(), mat4.create(), angle, rotAxis);
        rotRevLook = vec4.transformMat4(vec4.create(), revLook, rotMatrix);
        vec3.normalize(cameraController.camera._up, vec3.cross(cameraController.camera._up, rotAxis, rotRevLook));
    } else
        rotRevLook = vec4.transformMat4(
            vec4.create(),
            revLook,
            mat4.rotate(mat4.create(), mat4.create(), angle, cameraController.camera._up)
        );

    //get new position by adding rotated reversed look vector to target position
    vec4.add(cameraController.camera.position, cameraController.camera.target, rotRevLook);
    cameraController.camera.direction = cameraController.camera.calculateDirection();
}

