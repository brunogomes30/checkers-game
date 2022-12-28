import { CGFappearance } from "../../../lib/CGF.js";
import { parseColor } from "./utils.js";

/**
 * Parses the <materials> node.
 * @param {XMLNode} materialsNode - The materials block element.
 * @param {MySceneGraph} sxsReader - The scene graph.
 */
export function parseMaterials(materialsNode, sxsReader) {
    const children = materialsNode.children;
    let materials = [];
    const defaultMaterial = sxsReader.graph.scene.defaultAppearance;

    // Any number of materials.
    for (let i = 0; i < children.length; i++) {
        const materialNode = children[i];
        if (materialNode.nodeName != "material") {
            sxsReader.graph.onXMLMinorError("unknown tag <" + materialNode.nodeName + ">");
            continue;
        }

        // Get id of the current material.
        let materialID = sxsReader.reader.getString(materialNode, 'id', false);
        if (materialID == null || materialID == '')
            return "no ID defined for material";

        // Checks for repeated IDs.
        if (materials[materialID] != null)
            return "ID must be unique for each material (conflict: ID = " + materialID + ")";

        //Continue here
        const material = parseMaterial(materialNode, materialID, sxsReader);
        if(typeof(material) == 'string') {
            return material;
        }
        if (material !== null) {
            materials[materialID] = material;
        } else {
            sxsReader.graph.onXMLMinorError(`Couldn't parse material(ID = ${materialId})`);
            materials[materialID] = defaultMaterial;
        }


    }

    sxsReader.attributes.set('materials', materials);
    return null;
}

/**
 * Parses a material node.
 * @param {XMLNode} materialNode - The material node element.
 * @param {String} materialID - The material ID.
 * @param {MySceneGraph} sxsReader - The scene graph.
 * @returns {CGFappearance} - The parsed material.
 * @returns {String} - An error message if an error occurred.
 */
function parseMaterial(node, materialID, sxsReader) {
    const shininess = sxsReader.reader.getFloat(node, 'shininess', false);
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
            const values = parseColor(child, `tag ${child.nodeName} in material '${materialID}'`, sxsReader);;
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

    const material = new CGFappearance(sxsReader.graph.scene);
    material.setShininess(shininess);
    material.setDiffuse(...properties['diffuse']);
    material.setEmission(...properties['emission'])
    material.setSpecular(...properties['specular']);
    material.setAmbient(...properties['ambient']);
    return material;
}
