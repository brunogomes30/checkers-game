import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation{
    constructor(scene, id, keyframes) {
        super(scene, id, Object.keys(keyframes)[0], Object.keys(keyframes)[Object.keys(keyframes).length - 1])
        this.keyframes = keyframes;
        this.lastKeyFrameTime = this.startTime;
        this.previousTransformations = this.keyframes[this.startTime];
        
        if (Object.keys(this.keyframes).length > 1) {
            this.nextKeyFrameTime = Object.keys(this.keyframes)[Object.keys(this.keyframes).indexOf(this.startTime) + 1];
        } else {
            this.nextKeyFrameTime = null;
        }
        this.nextTransformations = this.keyframes[this.nextKeyFrameTime];
    }

    update(timeDelta) {
        if (timeDelta < this.startTime) {
            return;
        }

        if (this.finished)
            return this.currentMatrix;

        if (this.currentMatrix === null) {
            this.started = true;

            this.currentMatrix = mat4.create();
            mat4.translate(this.currentMatrix, this.currentMatrix, this.previousTransformations[0]);
            mat4.rotateZ(this.currentMatrix, this.currentMatrix, this.previousTransformations[1]);
            mat4.rotateY(this.currentMatrix, this.currentMatrix, this.previousTransformations[2]);
            mat4.rotateX(this.currentMatrix, this.currentMatrix, this.previousTransformations[3]);
            mat4.scale(this.currentMatrix, this.currentMatrix, this.previousTransformations[4]);

            if (this.nextKeyFrameTime === null) {
                this.finished = true;
                return;
            }
        }

        let t = (timeDelta - this.lastKeyFrameTime) / (this.nextKeyFrameTime - this.lastKeyFrameTime);
        if (t > 1) {
            
            let newIndex = Object.keys(this.keyframes).indexOf(this.nextKeyFrameTime) + 1;
            if (newIndex < Object.keys(this.keyframes).length) {
                this.previousTransformations = this.nextTransformations;
                this.lastKeyFrameTime = this.nextKeyFrameTime;
                this.nextKeyFrameTime = Object.keys(this.keyframes)[newIndex];
                this.nextTransformations = this.keyframes[this.nextKeyFrameTime];
            } else {
                t = 1;
                this.finished = true;
            }

        }
        // transformationOperationsOrder = ['translation', 'rotation', 'rotation', 'rotation', 'scale'];
        // rotationOperationsOrder = ['z', 'y', 'x'];
        let matrix = mat4.create();
        
        let translation = vec3.create();
        vec3.lerp(translation, this.previousTransformations[0], this.nextTransformations[0], t);
        mat4.translate(matrix, matrix, translation);

        let nextRotationVec = [this.nextTransformations[1][1], this.nextTransformations[2][1], this.nextTransformations[3][1]];
        let previousRotationVec = [this.previousTransformations[1][1], this.previousTransformations[2][1], this.previousTransformations[3][1]]
        let rotationVec = vec3.create();
        vec3.lerp(rotationVec, previousRotationVec, nextRotationVec, t);
        mat4.rotateZ(matrix, matrix, rotationVec[0]);
        mat4.rotateY(matrix, matrix, rotationVec[1]);
        mat4.rotateX(matrix, matrix, rotationVec[2]);
        
        let nextScale = vec3.create();
        vec3.lerp(nextScale, this.previousTransformations[4], this.nextTransformations[4], t);
        mat4.scale(matrix, matrix, nextScale);
        
        this.currentMatrix = matrix;
    }
}
