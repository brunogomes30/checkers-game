import { Component } from '../components/Component.js'
import { parseTransformation } from './transformations.js';
import { TextureScaleFactors } from '../textures/TextureScaleFactors.js'
/**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
export function parseComponents(componentsNode, graph) {
    const componentNodes = componentsNode.children;

    graph.components = [];

    let grandChildren = [];
    const grandgrandChildren = [];

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

        // Transformations
        const transfMatrix = parseTransformation(grandChildren[transformationIndex], graph, "component ID " + componentID, false)
        if (typeof (transfMatrix) == 'string') {
            return transfMatrix;
        }
        // Materials
        const materialsNode = grandChildren[materialsIndex];
        const materials = []
        if (materialsNode !== undefined) {
            for (let i = 0; i < materialsNode.children.length; i++) {
                const matId = graph.reader.getString(materialsNode.children[i], 'id');
                if (matId !== null) {
                    if (matId === 'inherit') {
                        materials.push('inherit');
                    } else {
                        materials.push(graph.materials[matId]);
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
                        if (textureInArr != undefined) {
                            if (length_s == 0 || length_t == 0){
                                graph.onXMLMinorError((length_s == 0 ? 'length_s ' : 'length_t ') + (length_s == 0 && length_t == 0 ? 'and length_t ' : '') + 'option(s) has / have invalid values (Zero). In component ' + componentID);
                                length_s = undefined;
                                length_t = undefined;
                            }
                            
                            texture = textureInArr[0];
                            textureScaleFactor = new TextureScaleFactors(length_s, length_t);
                        } else {
                            graph.onXMLMinorError(`Texture "${textureId}" not declared, used in component "$componentID}"`);
                        }
                    }
                }
            }
        }


        // Children
        const childrenNodes = grandChildren[childrenIndex].children;
        const componentChildren = [];
        for (let i = 0; i < childrenNodes.length; i++) {
            const child = childrenNodes[i];
            const id = graph.reader.getString(child, "id");
            if (child.nodeName === 'primitiveref') {
                if(graph.primitives[id] === undefined){
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

        const component = new Component(graph.scene, transfMatrix, materials, texture, textureScaleFactor, componentChildren);
        graph.components[componentID] = component;
    }


    // Change all component reference strings to the component reference
    for (const key in graph.components) {
        const component = graph.components[key];
        for (const childKey in component.children) {
            const child = component.children[childKey];
            if (typeof child === 'string') {
                component.children[childKey] = graph.components[child];
            }

        }
    }

    return null;
}
