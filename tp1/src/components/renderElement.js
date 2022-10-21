import { CGFappearance } from '../../../lib/CGF.js';
import { Texture } from '../textures/Texture.js'
import { TextureScaleFactors } from '../textures/TextureScaleFactors.js';
import { Component } from './Component.js'

/**
 * Renders a component or primitive.
 * If it's a component, applies transformations, materials and textures
 * If it's a component or primitive, displays the object
 * @param {Component|CGFobject} element 
 * @param {Array} parents - The parents of the element
 */
export function renderElement(element, parents = []) {
    if (element instanceof Component) {
        renderComponent(element, parents);
    } else {
        displayPrimitive(element, parents);
    }
}

/**
 * Renders a component
 * @param {Component|CGFobject} element 
 * @param {Array} parents - The parents of the element
 */
function renderComponent(element, parents) {
    parents.push(element);
    element.scene.pushMatrix();
    //Apply transformations
    element.scene.multMatrix(element.transformation)

    //Apply textures
    element.children.forEach(function (child) {
        applyAppearance(element, parents);
        renderElement(child, parents);
    });
    element.scene.popMatrix();
    parents.pop();
}


/**
 * Displays a primitive
 * @param {CGFobject} element
 * @param {Array} parents - The parents of the primitive
 */
function displayPrimitive(element, parents) {
    applyTextureScaling(element, parents)
    if(element.scene.displayNormals){
        element.enableNormalViz();
    }
    else{
        element.disableNormalViz();
    }
    element.display();
    
}

/**
 * Applies the appearance of the element
 * @param {Component} element
 * @param {Array} parents - The parents of the element
 */
function applyAppearance(element, parents) {
    let material = getMaterial(element, parents);
    setTexture(element, parents, material)
    material.apply()
}

/**
 * Gets the material of the element
 * @param {Component} element
 * @param {Array} parents - The parents of the element
 * @returns {CGFappearance} The material to be applied on the element
 */
function getMaterial(element, parents) {
    let material = element.getMaterial();
    if (material === 'inherit') {
        for (let i = parents.length - 1; i >= 0; i--) {
            material = parents[i].getMaterial();
            if (material instanceof CGFappearance) {
                break;
            }
        }
    }
    return material;
}

/**
 * Sets the texture of the element
 * @param {Component} element
 * @param {Array} parents - The parents of the element
 * @param {CGFappearance} material - The material to be applied on the element
 */
function setTexture(element, parents, material) {
    let texture = element.texture;
    const wasInherit = texture === 'inherit';
    if (wasInherit) {
        for (let i = parents.length - 1; i >= 0; i--) {
            texture = parents[i].texture;
            if (texture instanceof Texture || texture !== 'inherit') {
                break;
            }
        }
    }
    if (!(texture instanceof Texture) || texture === undefined) {
        if (wasInherit && texture === 'inherit') {
            material.setTexture(element.scene.defaultTexture);
        } else {
            material.setTexture(null);
        }
        return;
    }

    material.setTexture(texture.texture);
}

/**
 * Applies the texture scaling of the element
 * @param {CGFobject} primitive
 * @param {Array} parents - The parents of the element
 */
function applyTextureScaling(primitive, parents) {
    let textureScaleFactor = new TextureScaleFactors(1, 1);
    let id = parents.length;
    while (id--) {
        if (parents[id].textureScaleFactor !== undefined) {
            textureScaleFactor = parents[id].textureScaleFactor
            break;
        }
    }
    
    primitive.updateTexCoords(textureScaleFactor.length_s, textureScaleFactor.length_t);
}
