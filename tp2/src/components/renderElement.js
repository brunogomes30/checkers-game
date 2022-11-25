import { CGFappearance, CGFobject } from '../../../lib/CGF.js';
import { Texture } from '../textures/Texture.js'
import { Component } from './Component.js'


/**
 * Renders a component or primitive.
 * If it's a component, applies transformations, materials and textures
 * If it's a component or primitive, displays the object
 * @param {Component|CGFobject} element 
 * @param {Array} parents - The parents of the element
 */
export function renderElement(element, parents = [], appearance = undefined) {
    if (element instanceof Component) {
        renderComponent(element, parents, appearance);
    } else {
        displayPrimitive(element, parents, appearance);
    }
}

/**
 * Renders a component
 * @param {Component|CGFobject} element 
 * @param {Array} parents - The parents of the element
 */
function renderComponent(element, parents) {
    if (!element.isDisplayed()) {
        return;
    }

    parents.push(element);
    element.scene.pushMatrix();

    element.scene.multMatrix(element.transformation);
    // Apply transformations and animations
    if (element.animation !== undefined) {
        element.animation.apply();
    }


    // Apply textures
    element.children.forEach(function (child) {
        const apperance = applyAppearance(element, parents);
        renderElement(child, parents, apperance);
    });
    element.scene.popMatrix();
    parents.pop();
}


/**
 * Displays a primitive
 * @param {CGFobject} element
 * @param {Array} parents - The parents of the primitive
 */
function displayPrimitive(element, parents, appearance = undefined) {
    const textureScalling = getTextureScaling(element, parents);
    if (element.scene.displayNormals) {
        element.enableNormalViz();
    }
    else {
        element.disableNormalViz();
    }
    const parent = parents[parents.length - 1];

    let shaderToApply;
    let shaderValues;
    const texture = getTexture(parents[0], parents);
    if (parent.highlight.isActive) {
        shaderToApply = parent.scene.highlightShader;
        const [r, g, b] = parent.highlight.color;
        shaderValues = {
            redValue: {
                type: 'literal',
                value: r
            },
            greenValue: {
                type: 'literal',
                value: g
            },
            blueValue: {
                type: 'literal',
                value: b
            },
            scaleH: {
                type: 'literal',
                value: parent.highlight.scale
            }
            //uSampler: {
            //    type: 'texture',
            //    value: texture instanceof Texture ? texture.id : 'default'
            //},
        }
    } else {
        shaderValues = {
            //uSampler: {
            //    type: 'texture',
            //    value: texture instanceof Texture ? texture.id : 'default'
            //},
        };
        shaderToApply = parent.scene.defaultShader;
    }


    const currentMatrix = parent.scene.getMatrix();
    parent.scene.addElementToDisplay(
        {
            element: element,
            shader: {
                shader: shaderToApply,
                values: shaderValues,
            },
            matrix: currentMatrix,
            texture: texture instanceof Texture ? texture : null,
            apperance: appearance,
            textureScalling: textureScalling
        }
    );
    //element.display();


}

/**
 * Applies the appearance of the element
 * @param {Component} element
 * @param {Array} parents - The parents of the element
 */
function applyAppearance(element, parents) {
    let material = getMaterial(element, parents);
    setTexture(element, parents, material)
    return material;
    //material.apply()
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
            material.setTexture(element.scene.defaultTexture.texture);
            element.unknownTexture = true;
        } else {
            material.setTexture(null);
            element.unknownTexture = false;
        }
        return;
    }


    if (texture.texture.texID === -1) {
        material.setTexture(element.scene.defaultTexture.texture);
        element.unknownTexture = true;
        return;
    }

    material.setTexture(texture.texture);
    element.unknownTexture = false;
}

function getTexture(element, parents) {
    let texture = element.texture;
    if (texture === 'inherit') {
        for (let i = parents.length - 1; i >= 0; i--) {
            texture = parents[i].texture;
            if (texture instanceof Texture || texture !== 'inherit') {
                break;
            }
        }
    }
    return texture;
}

/**
 * Applies the texture scaling of the element
 * @param {CGFobject} primitive
 * @param {Array} parents - The parents of the element
 */
function getTextureScaling(primitive, parents) {
    let parentsIndex = parents.length;
    let textureScaleFactor;
    // Setting default texture scaling from scene
    if (parentsIndex > 0) {
        textureScaleFactor = parents[parentsIndex - 1].scene.defaultTextureScaling;
    } else {
        // A primitive is never drawn without a parent; Never happens
        console.log("AQUI");
        return;
    }

    // If the primitive parent doesn't have a problematic texture, search for a texture scaling
    if (!parents[parentsIndex - 1].unknownTexture) {
        while (parentsIndex--) {
            if (parents[parentsIndex].textureScaleFactor !== undefined) {
                textureScaleFactor = parents[parentsIndex].textureScaleFactor
                break;
            }
        }
    }

    return textureScaleFactor;
    //primitive.updateTexCoords(textureScaleFactor.length_s, textureScaleFactor.length_t);
}
