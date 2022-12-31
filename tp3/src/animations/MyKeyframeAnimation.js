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
    constructor(scene, id, keyframes, speed, isLooping, params) {
        const keys = Object.keys(keyframes);
        super(scene, id, keys[0], keys[keys.length - 1])
        this.keyframeTimes = [];
        for(let i=0; i<keys.length; i++){
            const obj = {
                time: parseFloat(keys[i]),
                keyframe: keyframes[keys[i]]
            }
            this.keyframeTimes.push(obj);
        }
        this.keyframeTimes.sort((a,b) => a.time-b.time);
        
        this.keyframes = keyframes;

        this.index = 0;
        this.advanceKeyframe();
        
        this.nloops = 0;
        this.animationTime = 0;
        this.speed = speed;
        this.isLooping = isLooping;
        this.willRemove = false;
        this.params = params;
        this.hooks = [];
        this.position = [0, 0, 0];
    }

    hookFunction(f){
        this.hooks.push(f);
    }

    clone(id) {
        console.log(this.keyframes)
        const newKeyframes = [];
        for (const key in this.keyframes) {
            newKeyframes[key] = JSON.parse(JSON.stringify(this.keyframes[key]));
        }

        return new MyKeyframeAnimation(this.scene, id, newKeyframes, this.speed, this.isLooping, this.params);
    }

    setParameter(name, value){
        this.params[name] = value;
    }

    applyParameters(){
        for(const key in this.params){
            const keys = Object.keys(this.keyframes);
            for(let j=0;j<keys.length; j++){
                const keyFrameKey = keys[j];
                if(keyFrameKey === 'length'){
                    continue;
                }
                const keyFrame = this.keyframes[keyFrameKey];
                for(let i=0; i<keyFrame.values.length; i++){
                    const array = keyFrame.values[i];
                    for(let k=0; k<array.length; k++){
                        if(array[k] === key){
                            array[k] = this.params[key];
                        }
                    }
                }
            }
        }
    }

    stopAnimation(callback){
        this.willRemove = true;
        this.isLooping = false;
        this.removeCallBack = callback;
    }

    applyToComponent(component){
        mat4.multiply(component.transformation, this.currentMatrix, component.transformation);
        component.position[0] += this.position[0];
        component.position[1] += this.position[1];
        component.position[2] += this.position[2];
        component.animation = undefined;
    }

    /**
     * Update the animation according to the time elapsed since the scene started
     * 
     * @param {number} timeDelta Elapsed time since last scene display
     * @returns 
     */
    update(timeDelta) {
        if(timeDelta > 0.20){
            //Value is too high for the animation to be smooth
            return;
        }
        this.animationTime += timeDelta * this.speed;
        timeDelta = this.animationTime;
        const keyFramesKeys = Object.keys(this.keyframes);
        const animationEnd = this.keyframeTimes[this.keyframeTimes.length - 1].time;
        if (timeDelta > animationEnd) {
            this.animationTime = 0;
            this.currentMatrix = this.calculateMatrix(this.previousTransformations, this.nextTransformations, 1);
            //Made new loop
            this.nloops++;
            if(this.isLooping){
                this.lastKeyFrameTime = this.keyframeTimes[0];
                this.previousTransformations = this.keyframeTimes[0].keyframe.values;
                if (keyFramesKeys.length > 1) {
                    this.advanceKeyframe();
                }
            } else if(this.willRemove){
                this.removeCallBack(this);
            }
        }
        if (this.scene.isLooping) {
            timeDelta %= animationEnd;
        } else {
            if (timeDelta > animationEnd) {
                //Stay at last keyframe when animation is over and isn't looping
                timeDelta = animationEnd;
                return;
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

        const duration = this.nextKeyFrameTime - this.lastKeyFrameTime;
        let t = (timeDelta - this.lastKeyFrameTime) / duration;
        
        if (t > 1) {
            //Last frame in current keyframe
            this.advanceKeyframe();
            t = 0;
        }
        t = getFunction(this.currentFunction)(t, duration);
        if(t > 1 && !this.allowOverflow){
            t = 1;
        }
        this.currentMatrix = this.calculateMatrix(this.previousTransformations, this.nextTransformations, t);

        //Call hooks
        for(let i=0; i<this.hooks.length; i++){
            this.hooks[i](this);
        }
        
    }
    
    calculateMatrix(previousMatrix, nextMatrix, t) {
        const matrix = mat4.create();
        const translation = vec3.create();
        vec3.lerp(translation, previousMatrix[0], nextMatrix[0], t);
        mat4.translate(matrix, matrix, translation);
        this.position = translation;

        const nextRotationVec = [nextMatrix[1][1], nextMatrix[2][1], nextMatrix[3][1]];
        const previousRotationVec = [previousMatrix[1][1], previousMatrix[2][1], previousMatrix[3][1]]
        const rotationVec = vec3.create();
        vec3.lerp(rotationVec, previousRotationVec, nextRotationVec, t);
        mat4.rotateZ(matrix, matrix, rotationVec[0]);
        mat4.rotateY(matrix, matrix, rotationVec[1]);
        mat4.rotateX(matrix, matrix, rotationVec[2]);

        let nextScale = vec3.create();
        vec3.lerp(nextScale, previousMatrix[4], nextMatrix[4], t);
        mat4.scale(matrix, matrix, nextScale);
        return matrix;
    }

    advanceKeyframe() {
        this.index = this.index + 1;
        if(this.index >= this.keyframeTimes.length){
            this.index = 1;
        }
        this.previousTransformations = this.keyframeTimes[this.index - 1].keyframe.values;
        this.lastKeyFrameTime = this.keyframeTimes[this.index - 1].time;
        this.nextKeyFrameTime = this.keyframeTimes[this.index].time;
        this.nextTransformations = this.keyframeTimes[this.index].keyframe.values;
        this.currentFunction = this.keyframeTimes[this.index].keyframe.functionName;
        this.allowOverflow = this.keyframeTimes[this.index].keyframe.allowOverflow;
    }
}

function getFunction(name, duration) {
    const values = name.split('_');
    name = values[0];
    for(let i=1; i<values.length; i++){
        values[i] = parseFloat(values[i]);
    }
    let f;
    switch(name){
        case 'linear':
            return function(t) { return t; };
        case 'quadratic':
            // values[1] = a
            // values[2] = b
            // values[3] = c
            // values[4] = t offset
            f = (t) => (values[1] + values[2]*t - 0.5*values[3]*t*t);
            let maxValue = f(values[2] / values[3]);
            return  (t) =>  f(t - values[4]) * 2; ;
        case 'cubic-bezier':
            const u0 = values[1];
            const u1 = values[2];
            const u2 = values[3];
            const u3 = values[4];
            f = (t) => (1-t)*(1-t)*(1-t)*u0 + 3*(1-t)*(1-t)*t*u1 + 3*(1-t)*t*t*u2 + t*t*t*u3;
            return (t) => f(t);

        
    }
}
