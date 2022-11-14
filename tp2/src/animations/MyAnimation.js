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

    update(timeDelta) { }

    apply() {
        if (this.currentMatrix !== null) {
            this.scene.multMatrix(this.currentMatrix);
        }
    }
}
