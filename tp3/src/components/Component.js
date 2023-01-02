import { CGFtexture } from "../../../lib/CGF.js";
import { XMLscene } from "../XMLscene.js";

/**
 *
 * Represents a component of the system.
 * @class
 * @abstract
 * @memberof module:tp1
 * @param {XMLscene} scene - The scene where the component will be displayed.
 * @param {string} transformation - The transformation matrix of the component.
 * @param {Array} materials - The materials of the component.
 * @param {CGFtexture} texture - The texture of the component.
 * @param {CGFtexture} texture - The texture of the component.
 * @export
 * @class Component
 */
export class Component{
    constructor(scene, {id, transformation, materials, texture, textureScaleFactor, primitiveChildren, componentChildren, modelChildren, textChildren, highlight, animation, pickable, position, className}){
        this.id = id;
        this.scene = scene;
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.textureScaleFactor = textureScaleFactor;
        this.primitiveChildren = primitiveChildren;
        this.componentChildren = componentChildren;
        this.textChildren = textChildren;
        this.modelChildren = modelChildren;
        this.highlight = highlight;
        this.animation = animation;
        this.children = [];
        this.pickable = pickable;
        this.position = position;
        if(position === undefined){
            this.position = [0, 0, 0];
        }
        this.className = className;
    }

    getPosition(){
        const position = [...this.position];
        if(this.animation !== undefined){
            if(!Array.isArray(this.animation)){
                position[0] += this.animation.position[0];
                position[1] += this.animation.position[1];
                position[2] += this.animation.position[2];
            } else {
                this.animation.forEach(anim => {
                    position[0] += anim.position[0];
                    position[1] += anim.position[1];
                    position[2] += anim.position[2];
                });
            }
        }
        return position;
    }

    translate(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        const translation = mat4.create();
        mat4.translate(translation, translation, [x, y, z]);
        mat4.multiply(translation, translation, this.transformation);
        this.transformation = translation;

    }

    /**
     * Get the current material of the component based on the current material index
     * @returns {CGFappearance} The current material of the component
     * @memberof Component
    */
    getMaterial() {
        return this.materials != undefined && this.materials.length > 0
            ? this.materials[this.scene.materialIndex % this.materials.length]
            : undefined;
    }

    /**
     * Check if object is to be displayed. In case of an animated object means that the animations started. Otherwise, it means that the object is always displayed.
     * @returns {boolean} True if object is to be displayed, false otherwise
     */
    isDisplayed(){
        if(Array.isArray(this.animation)){
            return true;
        }
        return this.animation === undefined ? true : this.animation.started;
    }

    clone(){
        const component = new Component(this.scene, this);
        component.children = this.children.map(child => child.clone());
        component.position = [...this.position];
        return component;
    }

    removeAnimation(animation){
        if(Array.isArray(this.animation)){
            this.animation = this.animation.filter(a => a !== animation);
        } else {
            this.animation = [];
        }
    }

    addAnimation(animation){
        if(this.animation === undefined){
            this.animation = [animation];
        }else if(Array.isArray(this.animation)){
            this.animation.push(animation);
        }else{
            this.animation = [this.animation, animation];
        }
    }

    getAnimation(conditionFunction){
        if(Array.isArray(this.animation)){
            return this.animation.find(conditionFunction);
        }
        if(this.animation === undefined){
            return undefined;
        }

        return conditionFunction(this.animation) ? this.animation : undefined;
    }
    
}
