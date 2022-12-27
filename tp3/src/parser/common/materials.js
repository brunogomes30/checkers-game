export function parseMaterials(sxsReader, materialsNode, id, type) {
    const materials = [];
    const children = materialsNode.children;
    if (materialsNode === undefined || children.length === 0) {
        sxsReader.graph.onXMLMinorError(`No materials defined for ${type} with ID = ${id}, using default material`);
        materials.push(sxsReader.scene.defaultAppearance);
    } else {
        let readMaterials = sxsReader.attributes.get('materials');
        for (let i = 0; i < children.length; i++) {
            const matId = sxsReader.reader.getString(children[i], 'id');
            if (matId !== null) {
                if (matId === 'inherit') {
                    materials.push('inherit');
                } else {
                    if (matId in readMaterials) {
                        materials.push(readMaterials[matId]);
                    }
                    else {
                        materials.push(sxsReader.graph.scene.defaultAppearance);
                        sxsReader.graph.sonXMLMinorError(`Matrial with ID '${matId}' not found, Using default material.`);
                    }
                }
            }
        }
    }
    return materials;
}