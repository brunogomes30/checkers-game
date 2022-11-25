import { MyAnimation } from "./MyAnimation.js";

/**
 * Animation class, representing an animation.
 * 
 * @constructor
 * @param {CGFscene} scene Scene to which the animation belongs
 * @param {string} id ID of the animation
 * @param {Array} keyframes Array of keyframes describing the animation (instant: [...transformations])
 * 
 * @extends MyAnimation
 * */
export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, id, keyframes) {
        super(scene, id, Object.keys(keyframes)[0], Object.keys(keyframes)[Object.keys(keyframes).length - 1])
        this.keyframes = keyframes;
        this.lastKeyFrameTime = this.startTime;
        this.previousTransformations = this.keyframes[this.startTime];

        if (Object.keys(keyframes).length > 1) {
            this.nextKeyFrameTime = Object.keys(keyframes)[Object.keys(keyframes).indexOf(this.startTime) + 1];
        } else {
            this.nextKeyFrameTime = null;
        }
        this.nextTransformations = this.keyframes[this.nextKeyFrameTime];
        this.nloops = 0;
    }

    /**
     * Update the animation according to the time elapsed since the scene started
     * 
     * @param {number} timeDelta Elapsed time since the scene first started
     * @returns 
     */
    update(timeDelta) {
        

        const keyFramesKeys = Object.keys(this.keyframes);
        const lastKeyFramesKey = keyFramesKeys[keyFramesKeys.length - 1];
        if (timeDelta / lastKeyFramesKey > this.nloops) {
            //Made new loop
            this.nloops++;
            if(this.scene.isLooping){
                this.lastKeyFrameTime = keyFramesKeys[0];
                this.previousTransformations = this.keyframes[this.lastKeyFrameTime];
                if (keyFramesKeys.length > 1) {
                    this.nextKeyFrameTime = keyFramesKeys[1];
                    this.nextTransformations = this.keyframes[this.nextKeyFrameTime];
                }
            }
        }
        if (this.scene.isLooping) {
            timeDelta %= lastKeyFramesKey;
        } else {
            if (timeDelta > lastKeyFramesKey) {
                //Stay at last keyframe when animation is over and isn't looping
                timeDelta = lastKeyFramesKey;
            }

        }

        //Can't display if animation hasn't started
        if (timeDelta < this.startTime) {
            this.started = false;
            return;
        }
        this.started = true;
        
        if (this.currentMatrix === null) {
            //Initialize animation
            this.currentMatrix = mat4.create();
            mat4.translate(this.currentMatrix, this.currentMatrix, this.previousTransformations[0]);
            mat4.rotateZ(this.currentMatrix, this.currentMatrix, this.previousTransformations[1]);
            mat4.rotateY(this.currentMatrix, this.currentMatrix, this.previousTransformations[2]);
            mat4.rotateX(this.currentMatrix, this.currentMatrix, this.previousTransformations[3]);
            mat4.scale(this.currentMatrix, this.currentMatrix, this.previousTransformations[4]);
        }

        let t = (timeDelta - this.lastKeyFrameTime) / (this.nextKeyFrameTime - this.lastKeyFrameTime);

        if (t > 1) {
            //Last frame in current keyframe
            let newIndex = keyFramesKeys.indexOf(this.nextKeyFrameTime) + 1;
            this.previousTransformations = this.nextTransformations;
            this.lastKeyFrameTime = this.nextKeyFrameTime;
            this.nextKeyFrameTime = keyFramesKeys[newIndex];
            this.nextTransformations = this.keyframes[this.nextKeyFrameTime];
            t = 0;
        }

        // calculate matrix
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
