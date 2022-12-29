import { Component } from '../components/Component.js'
import { parseTransformation } from './transformations.js';
import { parseMaterials } from './common/materials.js';
import { parseTexture } from './common/texture.js';
import { parseColor } from './utils.js';
import { Highlight } from '../components/Highlight.js';
import { TextElement } from '../text/TextElement.js';
/**
   * Parses the <components> block.
   * @param {XMLNode} componentsNode - The components block element.
   * @param {SceneGraph} graph - The scene graph.
   */
export function parseComponents(componentsNode, graph) {
    const componentNodes = componentsNode.children;

    graph.components = [];
    graph.class_components = {};
    let grandChildren = [];
    if (componentNodes.length === 0) {
        return 'There is no components in the xml file.';
    }
    // Any number of components.
    for (let i = 0; i < componentNodes.length; i++) {
        if (componentNodes[i].nodeName !== "component") {
            graph.onXMLMinorError("unknown tag <" + componentNodes[i].nodeName + ">");
            continue;
        }

        // Get id of the current component.
        const componentID = graph.reader.getString(componentNodes[i], 'id');
        if (componentID === null)
            return "no ID defined for componentID";

        // Get class of the current component.
        const componentClass = graph.reader.getString(componentNodes[i], 'class', false);

        // Checks for repeated IDs.
        if (graph.components[componentID] !== undefined)
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
        const transfMatrix = parseTransformation(grandChildren[transformationIndex], graph, "component ID " + componentID, false)
        if (typeof (transfMatrix) == 'string') {
            return transfMatrix;
        }
        // Materials
        const materialsNode = grandChildren[materialsIndex];
        const materials = parseMaterials(graph, materialsNode, componentID, 'component');
        // Texture
        // <texture id="ss" length_s="ff" length_t="ff"/>        
        let textureNode = grandChildren[textureIndex]
        let { texture, textureScaleFactor } = parseTexture(graph, textureNode, componentID, 'component');

        let highlight = new Highlight();
        // Hightlight
        if (highlightIndex != -1) {
            const highlightNode = grandChildren[highlightIndex];
            highlight.color = parseColor(highlightNode, ` highlight node in component "${componentID}"`, graph, false);
            if (highlight.color instanceof String) {
                return highlight.color;
            }
            highlight.scale = graph.reader.getFloat(highlightNode, 'scale_h', false);
            if (!(highlight.scale != null && !isNaN(highlight.scale))) {
                return `unable to set scale_h of the hightlight node in component "${componentID}"`;
            }
            highlight.isActive = true;
            highlight.hasHighlight = true;
            graph.scene.highlightedComponents[componentID] = true;
        }

        // Children
        if (childrenIndex == -1) {
            return `Children tag missing for component ID = '${componentID}'`;
        }
        const childrenNodes = grandChildren[childrenIndex].children;
        const componentChildren = [];
        for (let i = 0; i < childrenNodes.length; i++) {
            const child = childrenNodes[i];
            const id = graph.reader.getString(child, "id", false);
            if (child.nodeName === 'primitiveref') {
                if (graph.primitives[id] === undefined) {
                    graph.onXMLMinorError(`Primitive "${id}" not found in component "${componentID}"`);
                    continue;
                }
                componentChildren.push(graph.primitives[id]);
            } else if (child.nodeName === 'componentref') {
                componentChildren.push(id);
            } else if (child.nodeName === 'modelref') {
                const model = graph.models[id];
                if (model instanceof String) {
                    return `Error parsing model "${id}" in component "${componentID}"`;
                }
                componentChildren.push(model);
            } else if(child.nodeName === 'text'){
                const text = graph.reader.getString(child, "value");
                if(text === null){
                    return `Error parsing text in component "${componentID}"`;
                }
                componentChildren.push(new TextElement(graph.scene, text));
            } else {
                graph.onXMLMinorError(`unknown tag <${child.nodeName}>`);
            }

        }
        // Animation
        // <animation id="ss" />
        let animationId = null;
        let animation = undefined;
        if (animationIndex !== -1) {
            animationId = graph.reader.getString(grandChildren[animationIndex], "id", false);

            if (animationId !== null && animationId !== 'none' && animationId !== '') {
                if (animationId in graph.animations) {
                    animation = graph.animations[animationId];
                } else {
                    graph.onXMLMinorError(`Animation with ID '${animationId}' not found, continuing without animation.`);
                }
            }
        }


        const component = new Component(graph.scene, {
            transformation: transfMatrix,
            materials: materials,
            texture: texture,
            textureScaleFactor: textureScaleFactor,
            children: componentChildren,
            animation: animation,
            highlight: highlight
        }
        );

        graph.components[componentID] = component;
        if (componentClass != null) {
            const list = graph.class_components[componentClass];
            if (list == undefined) {
                graph.class_components[componentClass] = [component];
            } else {
                list.push(component);
            }
        }
    }


    // Change all component reference strings to the component reference
    for (const key in graph.components) {
        const component = graph.components[key];
        for (const childKey in component.children) {
            const child = component.children[childKey];
            if (typeof child === 'string') {
                if (graph.components[child] != undefined) {
                    component.children[childKey] = graph.components[child];
                }
                else {
                    return `Unable to find referenced component '${child}' in component '${key}'`
                }
            }
        }
    }

    return null;
}
