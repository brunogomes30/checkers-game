import { CGFappearance } from '../../../lib/CGF.js';
import { Component } from './Component.js'

/**
 * Renders a component or primitive.
 * If it's a component, applies transformations, materials and textures
 * If it's a component or primitive, displays the object
 * @param {} element 
 */
export function renderElement(element, parents = []) {
    if (element instanceof Component) {
        renderComponent(element, parents);
    } else {
        displayPrimitive(element);
    }
}

function renderComponent(element, parents = []) {
    parents.push(element);
    element.scene.pushMatrix();
    //Apply transformations
    element.scene.multMatrix(element.transformation)

    //Apply textures
    element.children.forEach(function (child){
        applyMaterial(element, parents);
        renderElement(child,parents, element);
        element.scene.setDefaultAppearance();
    });
    element.scene.popMatrix();
    parents.pop();
}

function displayPrimitive(element) {
    element.display();
}

function applyMaterial(element, parents){
    let material = element.getMaterial();
    if(material === 'inherit'){
        //TODO:: parents could be a stack
        for(let i=parents.length - 1; i>=0;i--){
            material = parents[i].getMaterial();
            if(material instanceof CGFappearance){
                break;
            }
        }
    }
    if(material !== undefined && material !== 'inherit'){
        material.apply();
    }
}