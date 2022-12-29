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

    setPickable(pickable, conditionFunction){
        if (conditionFunction == undefined) {
            conditionFunction = () => { return true; };
        }
        if(pickable){
            Object.keys(this.objects).forEach((key) => {
                this.objects[key].setPickable(pickable, conditionFunction);
            });
        }
    }

    setClass(className, conditionFunction){
        if (conditionFunction == undefined) {
            conditionFunction = () => { return true; };
        }
        Object.keys(this.objects).forEach((key) => {
            this.objects[key].setClass(className, conditionFunction);
        });
    }

    genericSet(attributeName, value, conditionFunction){
        if (conditionFunction == undefined) {
            conditionFunction = () => { return true; };
        }
        Object.keys(this.objects).forEach((key) => {
            this.objects[key].genericSet(attributeName, value, conditionFunction);
        });
    }

    display() {
        Object.keys(this.objects).forEach((key) => {
            const object = this.objects[key];
            const material = object.material;
            if(material != undefined) {
                material.apply();
            }
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

    clone(){
        const model = new MyModel(this.scene, []);
        for(let key in this){
            if(key === "objects" || key === "scene"){
                continue;
            }
            model[key] = this[key];
        }
        for(let key in this.objects){
            model.objects[key] = this.objects[key].clone();
        }
        model.materials = this.materials;
        model.texture = this.texture;
        model.textureScaleFactor = this.textureScaleFactor;
        return model;
    }


}