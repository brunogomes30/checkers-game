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
   * @param {SceneGraph} sxsReader - The scene graph.
   */
export function parseComponents(componentsNode, sxsReader) {
    const componentNodes = componentsNode.children;

    let components = [];
    let class_components = {};
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

        // Get class of the current component.
        const componentClass = sxsReader.reader.getString(componentNodes[i], 'class', false);
        
        //Check if is pickable
        let pickable = sxsReader.reader.getBoolean(componentNodes[i], 'pickable', false);
        if(pickable === null){
            pickable = false;
        }

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
        const results = parseTransformation(grandChildren[transformationIndex], sxsReader, "component ID " + componentID, false);
        if (typeof (results) == 'string') {
            return results;
        }
        const transfMatrix = results.matrix;
        const position = results.position;

        
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
        }

        // Children
        if (childrenIndex == -1) {
            return `Children tag missing for component ID = '${componentID}'`;
        }
        const childrenNodes = grandChildren[childrenIndex].children;
        const componentChildren = [];
        const primitiveChildren = [];
        const modelChildren = [];
        const textChildren = [];
        for (let i = 0; i < childrenNodes.length; i++) {
            const child = childrenNodes[i];
            const id = sxsReader.reader.getString(child, "id", false);
            if (child.nodeName === 'primitiveref') {
                primitiveChildren.push(id);
            } else if (child.nodeName === 'componentref') {
                componentChildren.push(id);
            } else if (child.nodeName === 'modelref') {
                modelChildren.push(id);
            } else if(child.nodeName === 'text'){
                const text = sxsReader.reader.getString(child, "value");
                if(text === null){
                    return `Error parsing text in component "${componentID}"`;
                }
                textChildren.push(new TextElement(sxsReader.graph.scene, text));
            } else {
                sxsReader.graph.onXMLMinorError(`unknown tag <${componentNodes[i].nodeName}>`);
            }

        }
        
        // Animation
        // <animation id="ss" />
        let animationId = null;
        let animation = undefined;
        
        if (animationIndex !== -1) {
            animationId = sxsReader.reader.getString(grandChildren[animationIndex], "id", false);

            if (animationId !== null && animationId !== 'none' && animationId !== '') {
                animation = animationId;
            }
        }


        const component = new Component(sxsReader.graph.scene, {
            id: componentID,
            transformation: transfMatrix,
            materials: materials,
            texture: texture,
            textureScaleFactor: textureScaleFactor,
            primitiveChildren: primitiveChildren,
            componentChildren: componentChildren,
            modelChildren: modelChildren,
            textChildren: textChildren,
            animation: animation,
            highlight: highlight,
            pickable: pickable,
            position: position,
            className: componentClass
        }
        );

        components[componentID] = component;
        if (componentClass != null) {
            const list = class_components[componentClass];
            if (list == undefined) {
                class_components[componentClass] = [component];
            } else {
                list.push(component);
            }
        }
    }


    // Change all component reference strings to the component reference
    for (const key in components) {
        const component = components[key];
        for (const childKey in component.children) {
            const child = component.children[childKey];
            if (typeof child === 'string') {
                if (graph.components[child] != undefined) {
                    component.children[childKey] = components[child];
                }
                else {
                    return `Unable to find referenced component '${child}' in component '${key}'`
                }
            }
        }
    }

    sxsReader.attributes.set('components', components);
    sxsReader.attributes.set('class_components', class_components);
    return null;
}
