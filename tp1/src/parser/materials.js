import { CGFappearance } from "../../../lib/CGF.js";

/**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
export function parseMaterials(materialsNode, graph) {
    const children = materialsNode.children;

    graph.materials = [];
    const defaultMaterial = getDefaultMaterial(graph.scene);
    
    let grandChildren = [];
    let nodeNames = [];

    // Any number of materials.
    for (let i = 0; i < children.length; i++) {
        const materialNode = children[i];
        if (materialNode.nodeName != "material") {
            graph.onXMLMinorError("unknown tag <" + materialNode.nodeName + ">");
            continue;
        }

        // Get id of the current material.
        let materialID = graph.reader.getString(materialNode, 'id');
        if (materialID == null || materialID == '')
            return "no ID defined for material";

        // Checks for repeated IDs.
        if (graph.materials[materialID] != null)
            return "ID must be unique for each light (conflict: ID = " + materialID + ")";

        //Continue here
        const material = parseMaterial(materialNode, graph);  
        if(material !== null){
            graph.materials[materialID] = material;
        } else {
            graph.onXMLMinorError(`Couldn't parse material(ID = ${materialId})`);
            graph.materials[materialID] = defaultMaterial;
        }

        
    }

    return null;
}

function parseMaterial(node, graph){
    const shininess = graph.reader.getFloat(node, 'shininess');

    
    const properties = {
        'emission': [0, 0, 0, 0],
        'ambient': [0, 0, 0, 0],
        'diffuse': [0, 0, 0, 0],
        'specular': [0, 0, 0, 0]
    };
    const nodeTypes = Object.keys(properties); 
    for(let i=0; i<node.children.length; i++){
        const child = node.children[i];
        if(nodeTypes.includes(child.nodeName)){
            const values = getLightValues(child, graph.reader);
            properties[child.nodeName] = values;
        }
    }

    const material = new CGFappearance(graph.scene);
    material.setShininess(1);
    material.setDiffuse(...properties['diffuse']);
    material.setEmission(...properties['emission'])
    material.setSpecular(...properties['specular']);
    material.setAmbient(...properties['ambient']);
    return material;
}

function getDefaultMaterial(scene){
    const material = new CGFappearance(scene);
    material.setShininess(1);
    material.setDiffuse(1, 1, 1, 1);
    material.setEmission(0, 0, 0, 0);
    material.setSpecular(0.5, 0.5, 0.5, 1);
    material.setAmbient(1, 1, 1, 1);
}

function getLightValues(node, reader){
    const lightValueTypes = ['r', 'g', 'b', 'a'];
    const values = [];
    for(let i=0;i<lightValueTypes.length; i++){
        const type = lightValueTypes[i];
        const value = reader.getFloat(node, type)
        if(value === null){
            values.push(0);
        }else {
            values.push(value);
        }
    }
    return values;
}