export function parseMaterials(sxsReader, materialsNode, id, type) {
    const materials = [];
    const children = materialsNode.children;
    if (materialsNode === undefined || children.length === 0) {
        sxsReader.graph.onXMLMinorError(`No materials defined for ${type} with ID = ${id}, using default material`);
        materials.push(sxsReader.scene.defaultAppearance);
    } else {
        for (let i = 0; i < children.length; i++) {
            const matId = sxsReader.reader.getString(children[i], 'id');
            if (matId !== null) {
                materials.push(matId);
            }
        }
    }
    return materials;
}