export function parseMaterials(graph, materialsNode, id, type) {
    const materials = [];
    const children = materialsNode.children;
    if (materialsNode === undefined || children.length === 0) {
        graph.onXMLMinorError(`No materials defined for ${type} with ID = ${id}, using default material`);
        materials.push(graph.scene.defaultAppearance);
    } else {
        for (let i = 0; i < children.length; i++) {
            const matId = graph.reader.getString(children[i], 'id');
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
    return materials;
}