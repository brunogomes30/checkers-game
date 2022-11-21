import { Component } from '../components/Component.js'
import { parseTransformation } from './transformations.js';
import { parseColor } from './utils.js';
import { TextureScaleFactors } from '../textures/TextureScaleFactors.js'
import { Highlight } from '../components/highlight.js';
/**
   * Parses the <components> block.
   * @param {XMLNode} componentsNode - The components block element.
   * @param {SceneGraph} graph - The scene graph.
   */
export function parseComponents(componentsNode, graph) {
    const componentNodes = componentsNode.children;

    graph.components = [];

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
        const materials = [];
        if (materialsNode === undefined || materialsNode.children.length === 0) {
            graph.onXMLMinorError(`No materials defined for component with ID = ${componentID}, using default material`);
            materials.push(graph.scene.defaultAppearance);
        } else {
            for (let i = 0; i < materialsNode.children.length; i++) {
                const matId = graph.reader.getString(materialsNode.children[i], 'id');
                if (matId !== null) {
                    if (matId === 'inherit') {
                        materials.push('inherit');
                    } else {
                        if (matId in graph.materials) {
                            materials.push(graph.materials[matId]);
                        }
                        else {
                            materials.push(graph.scene.defaultAppearance);
                            graph.onXMLMinorError(`Matrial with ID '${matId}' not found, Using default material.`);
                        }
                    }
                }
            }
        }
        // Texture
        // <texture id="ss" length_s="ff" length_t="ff"/>        
        let textureNode = grandChildren[textureIndex]
        let texture;
        let textureScaleFactor;
        if (textureNode == null) {
            graph.onXMLMinorError("Texture tag not present for component " + componentID);
        } else {
            let textureId = graph.reader.getString(textureNode, 'id', false);
            if (textureId == null) {
                graph.onXMLMinorError("Invalid texture id for component " + componentID);
            } else {
                if (textureId == '') {
                    graph.onXMLMinorError('Texture "' + textureId + '" not declared, used in component "' + componentID + '"');
                } else {
                    let length_s = graph.reader.getFloat(textureNode, 'length_s', false);
                    let length_t = graph.reader.getFloat(textureNode, 'length_t', false);

                    if (textureId == 'inherit' || textureId == 'none') {
                        texture = textureId
                        if (length_s != null || length_t != null) {
                            graph.onXMLMinorError((length_s != null ? 'length_s ' : 'length_t ') + (length_s != null && length_t != null ? 'and length_t ' : '') + 'shouldn\'t be used with ' + textureId + ' texture. In component ' + componentID);
                        }
                    } else {
                        if (length_s == null || length_t == null) {
                            graph.onXMLMinorError((length_s == null ? 'length_s ' : 'length_t ') + (length_s == null && length_t == null ? 'and length_t ' : '') + 'option(s) mising for texture ' + textureId + '. In component ' + componentID);
                        }
                        let textureInArr = graph.textures.filter(texture => texture.id == textureId);
                        if (textureInArr.length > 0) {
                            if (length_s == 0 || length_t == 0) {
                                graph.onXMLMinorError((length_s == 0 ? 'length_s ' : 'length_t ') + (length_s == 0 && length_t == 0 ? 'and length_t ' : '') + 'option(s) has / have invalid values (Zero). In component ' + componentID);
                                length_s = undefined;
                                length_t = undefined;
                            }

                            texture = textureInArr[0];
                            textureScaleFactor = new TextureScaleFactors(length_s, length_t);
                        } else {
                            texture = graph.scene.defaultTexture
                            textureScaleFactor = graph.scene.defaultTextureScaling;
                            graph.onXMLMinorError(`Texture "${textureId}" not declared, used in component "${componentID}"`);
                        }
                    }
                }
            }
        }

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
        }

        // Children
        if (childrenIndex == -1) {
            return `Children tag missing for component ID = '${componentID}'`;
        }
        const childrenNodes = grandChildren[childrenIndex].children;
        const componentChildren = [];
        for (let i = 0; i < childrenNodes.length; i++) {
            const child = childrenNodes[i];
            const id = graph.reader.getString(child, "id");
            if (child.nodeName === 'primitiveref') {
                if (graph.primitives[id] === undefined) {
                    graph.onXMLMinorError(`Primitive "${id}" not found in component "${componentID}"`);
                    continue;
                }
                componentChildren.push(graph.primitives[id]);
            } else if (child.nodeName === 'componentref') {
                componentChildren.push(id);
            } else {
                graph.onXMLMinorError(`unknown tag <${componentNodes[i].nodeName}>`);
            }

        }
        // Animation
        // <animation id="ss" />
        let animationId = null;
        let animation = undefined;
        if (animationIndex == -1) {
            //graph.onXMLMinorError(`Animation tag missing for component ID = '${componentID}'`);
        }
        if (animationIndex !== -1) {
            animationId = graph.reader.getString(grandChildren[animationIndex], "id", false);

            if (animationId === null || animationId === 'none' || animationId === '') {
                animation = undefined;
            } else {
                if (animationId in graph.animations) {
                    animation = graph.animations[animationId];
                } else {
                    graph.onXMLMinorError(`Animation with ID '${animationId}' not found, continuing without animation.`);
                    animation = undefined;
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
