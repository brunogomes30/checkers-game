import { CGFappearance } from "../../../lib/CGF.js";
import { parseColor } from "./utils.js";

/**
 * Parses the <materials> node.
 * @param {XMLNode} materialsNode - The materials block element.
 * @param {MySceneGraph} graph - The scene graph.
 */
export function parseMaterials(materialsNode, graph) {
    const children = materialsNode.children;
    graph.materials = [];
    const defaultMaterial = graph.scene.defaultAppearance;

    // Any number of materials.
    for (let i = 0; i < children.length; i++) {
        const materialNode = children[i];
        if (materialNode.nodeName != "material") {
            graph.onXMLMinorError("unknown tag <" + materialNode.nodeName + ">");
            continue;
        }

        // Get id of the current material.
        let materialID = graph.reader.getString(materialNode, 'id', false);
        if (materialID == null || materialID == '')
            return "no ID defined for material";

        // Checks for repeated IDs.
        if (graph.materials[materialID] != null)
            return "ID must be unique for each material (conflict: ID = " + materialID + ")";

        //Continue here
        const material = parseMaterial(materialNode, materialID, graph);
        if(typeof(material) == 'string') {
            return material;
        }
        if (material !== null) {
            graph.materials[materialID] = material;
        } else {
            graph.onXMLMinorError(`Couldn't parse material(ID = ${materialId})`);
            graph.materials[materialID] = defaultMaterial;
        }


    }

    return null;
}

/**
 * Parses a material node.
 * @param {XMLNode} materialNode - The material node element.
 * @param {String} materialID - The material ID.
 * @param {MySceneGraph} graph - The scene graph.
 * @returns {CGFappearance} - The parsed material.
 * @returns {String} - An error message if an error occurred.
 */
function parseMaterial(node, materialID, graph) {
    const shininess = graph.reader.getFloat(node, 'shininess', false);
    if (shininess == null || isNaN(shininess) || shininess <= 0) {
        return `Invalid value for material shininess in material '${materialID}'`
    }

    const properties = {
        'emission': undefined,
        'ambient': undefined,
        'diffuse': undefined,
        'specular': undefined
    };

    const nodeTypes = Object.keys(properties);
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (nodeTypes.includes(child.nodeName)) {
            const values = parseColor(child, `tag ${child.nodeName} in material '${materialID}'`, graph);;
            if(typeof(values) == 'string') {
                return values;
            }
            properties[child.nodeName] = values;
        }
    }
    
    for(const property in properties) {
        if (properties[property] == undefined) {
            return `Missing ${property} tag in material '${materialID}'`;
        }
    }

    const material = new CGFappearance(graph.scene);
    material.setShininess(shininess);
    material.setDiffuse(...properties['diffuse']);
    material.setEmission(...properties['emission'])
    material.setSpecular(...properties['specular']);
    material.setAmbient(...properties['ambient']);
    return material;
}
