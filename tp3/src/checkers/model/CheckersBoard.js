export class CheckersBoard {
    constructor(scene, size, component) {
        this.scene = scene;
        this.ysize = size;
        this.xsize = size;
        this.component = component;
        this.pieceMap = [];
    }
}
