import { Component } from '../components/Component.js'
import { parseTransformation } from './transformations.js';
import { parseMaterials } from './common/materials.js';
import { parseTexture } from './common/texture.js';
import { parseColor } from './utils.js';
import { Highlight } from '../components/Highlight.js';
import { parseObjFile } from './objFile.js';
/**
   * Parses the <components> block.
   * @param {XMLNode} componentsNode - The components block element.
   * @param {SceneGraph} sxsReader - The scene graph.
   */
export function parseComponents(componentsNode, sxsReader) {
    const componentNodes = componentsNode.children;

    let components = [];

    let grandChildren = [];
    if (componentNodes.length === 0) {
        return 'There is no components in the xml file.';
    }
    // Any number of components.
    for (let i = 0; i < componentNodes.length; i++) {
        if (componentNodes[i].nodeName !== "component") {
            sxsReader.graph.onXMLMinorError("unknown tag <" + componentNodes[i].nodeName + ">");
            continue;
        }

        // Get id of the current component.
        const componentID = sxsReader.reader.getString(componentNodes[i], 'id');
        if (componentID === null)
            return "no ID defined for componentID";

        // Checks for repeated IDs.
        if (components[componentID] !== undefined)
            return "ID must be unique for each component (conflict: ID = " + componentID + ")";

        grandChildren = componentNodes[i].children;

        const nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        const transformationIndex = nodeNames.indexOf("transformation");
        const materialsIndex = nodeNames.indexOf("materials");
        const textureIndex = nodeNames.indexOf("texture");
        const childrenIndex = nodeNames.indexOf("children");
        const highlightIndex = nodeNames.indexOf("highlighted");
        const animationIndex = nodeNames.indexOf("animation");

        // Transformations    
        if (transformationIndex == -1) {
            return `No transformations tag in component with ID = ${componentID}`
        }
        const transfMatrix = parseTransformation(grandChildren[transformationIndex], sxsReader, "component ID " + componentID, false)
        if (typeof (transfMatrix) == 'string') {
            return transfMatrix;
        }
        // Materials
        const materialsNode = grandChildren[materialsIndex];
        const materials = parseMaterials(sxsReader, materialsNode, componentID, 'component');
        // Texture
        // <texture id="ss" length_s="ff" length_t="ff"/>        
        let textureNode = grandChildren[textureIndex]
        let { texture, textureScaleFactor } = parseTexture(sxsReader, textureNode, componentID, 'component');

        let highlight = new Highlight();
        // Hightlight
        if (highlightIndex != -1) {
            const highlightNode = grandChildren[highlightIndex];
            highlight.color = parseColor(highlightNode, ` highlight node in component "${componentID}"`, sxsReader, false);
            if (highlight.color instanceof String) {
                return highlight.color;
            }
            highlight.scale = sxsReader.reader.getFloat(highlightNode, 'scale_h', false);
            if (!(highlight.scale != null && !isNaN(highlight.scale))) {
                return `unable to set scale_h of the hightlight node in component "${componentID}"`;
            }
            highlight.isActive = true;
            highlight.hasHighlight = true;
            sxsReader.graph.scene.highlightedComponents[componentID] = true;
        }

        // Children
        if (childrenIndex == -1) {
            return `Children tag missing for component ID = '${componentID}'`;
        }
        const childrenNodes = grandChildren[childrenIndex].children;
        const componentChildren = [];
        const readPrimitives = sxsReader.attributes.get('primitives');
        const readModels = sxsReader.attributes.get('models');
        for (let i = 0; i < childrenNodes.length; i++) {
            const child = childrenNodes[i];
            const id = sxsReader.reader.getString(child, "id");
            if (child.nodeName === 'primitiveref') {
                if (readPrimitives[id] === undefined) {
                    sxsReader.onXMLMinorError(`Primitive "${id}" not found in component "${componentID}"`);
                    continue;
                }
                componentChildren.push(readPrimitives[id]);
            } else if (child.nodeName === 'componentref') {
                componentChildren.push(id);
            } else if (child.nodeName === 'modelref') {
                const model = readModels[id];
                if (model instanceof String) {
                    return `Error parsing model "${id}" in component "${componentID}"`;
                }
                componentChildren.push(model);
            } else {
                sxsReader.graph.onXMLMinorError(`unknown tag <${componentNodes[i].nodeName}>`);
            }

        }
        // Animation
        // <animation id="ss" />
        let animationId = null;
        let animation = undefined;
        const readAnimations = sxsReader.attributes.get('animations');
        if (animationIndex !== -1) {
            animationId = sxsReader.reader.getString(grandChildren[animationIndex], "id", false);

            if (animationId !== null && animationId !== 'none' && animationId !== '') {
                if (animationId in readAnimations) {
                    animation = readAnimations[animationId];
                } else {
                    sxsReader.graph.onXMLMinorError(`Animation with ID '${animationId}' not found, continuing without animation.`);
                }
            }
        }


        const component = new Component(sxsReader.graph.scene, {
            transformation: transfMatrix,
            materials: materials,
            texture: texture,
            textureScaleFactor: textureScaleFactor,
            children: componentChildren,
            animation: animation,
            highlight: highlight
        }
        );

        components[componentID] = component;
    }

    


    // Change all component reference strings to the component reference
    for (const key in components) {
        const component = components[key];
        for (const childKey in component.children) {
            const child = component.children[childKey];
            if (typeof child === 'string') {
                if (components[child] != undefined) {
                    component.children[childKey] = components[child];
                }
                else {
                    return `Unable to find referenced component '${child}' in component '${key}'`
                }
            }
        }
    }

    sxsReader.attributes.set('components', components);
    return null;
}
