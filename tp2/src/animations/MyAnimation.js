/**
 * Animation class, representing an animation.
 * 
 * @param {CGFscene} scene Scene to which the animation belongs
 * @param {string} id ID of the animation
 * @param {number} startTime Start time of the animation
 * @param {number} endTime End time of the animation
 */
export class MyAnimation {
    constructor(scene, id, startTime, endTime) {
        this.scene = scene;
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.finished = false;
        this.started = false;
        this.currentMatrix = null;
    }

    /**
     * Updates the animation
     * Method to be overriden by subclasses
     * 
     * @param {number} timeDelta Time elapsed since the scene first started
     */ 
    update(timeDelta) { }

    /**
     * Applies the animation transformations to the scene
     */
    apply() {
        if (this.currentMatrix !== null) {
            this.scene.multMatrix(this.currentMatrix);
        }
    }
}
