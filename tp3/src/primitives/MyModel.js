import { CGFobject } from '../../../lib/CGF.js';

export class MyModel{
    constructor(scene, objects) {
        this.scene = scene;
        this.objects = objects;
        this.materials = undefined;
        this.texture = undefined;
        this.textureScaleFactor = undefined;
    }

    initBuffers() {
        Object.keys(this.objects).forEach((key) => {
            this.objects[key].initBuffers();
        });
    }

    display() {
        
        Object.keys(this.objects).forEach((key) => {
            this.objects[key].display();
        });
        
    }

    updateTexCoords(length_s, length_t) {
        Object.keys(this.objects).forEach((key) => {
            this.objects[key].updateTexCoords(length_s, length_t);
        });
    }

    enableNormalViz() {
        Object.keys(this.objects).forEach((key) => {
            this.objects[key].enableNormalViz();
        });
    }

    disableNormalViz() {
        Object.keys(this.objects).forEach((key) => {
            this.objects[key].disableNormalViz();
        });
    }


}