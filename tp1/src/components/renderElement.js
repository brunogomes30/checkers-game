import { Component } from './Component.js'

/**
 * Renders a component or primitive.
 * If it's a component, applies transformations, materials and textures
 * If it's a component or primitive, displays the object
 * @param {} element 
 */
export function renderElement(element) {
    if (element instanceof Component) {
        renderComponent(element);
    } else {
        displayPrimitive(element);
    }
}

function renderComponent(element) {
    element.scene.pushMatrix();
    //Apply transformations
    element.scene.multMatrix(element.transformation)

    //Apply materials
    //Apply textures

    element.children.forEach((child) => renderElement(child));
    element.scene.popMatrix();
}

function displayPrimitive(element) {
    element.display();
}