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
    constructor(scene, {id, transformation, materials, texture, textureScaleFactor, primitiveChildren, componentChildren, modelChildren, highlight, animation}){
        this.id = id;
        this.scene = scene;
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.textureScaleFactor = textureScaleFactor;
        this.primitiveChildren = primitiveChildren;
        this.componentChildren = componentChildren;
        this.modelChildren = modelChildren;
        this.highlight = highlight;
        this.animation = animation
        this.children = [];
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
        return this.animation === undefined ? true : this.animation.started;
    }
}
