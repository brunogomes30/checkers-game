/**
 * Parses the <primitives> block.
 * @param {XMLNode} primitivesNode - The primitives block element.
 * @param {MySceneGraph} graph - The scene graph.
 */
export function parsePrimitives(primitivesNode, graph) {
    const children = primitivesNode.children;
    if (children.length == 0) {
        return 'No primitives defined'
    }

    graph.primitives = [];

    // Any number of primitives.
    for (let i = 0; i < children.length; i++) {

        if (children[i].nodeName != "primitive") {
            graph.onXMLMinorError(`unknown tag <${children[i].nodeName}>`);
            continue;
        }

        // Get id of the current primitive.
        const primitiveId = graph.reader.getString(children[i], 'id');
        if (primitiveId == null || primitiveId == '') {
            return "no ID defined for primitive in <primitives> block";
        }

        // Checks for repeated IDs.
        if (graph.primitives[primitiveId] != null) {
            return `ID must be unique for each primitive (conflict: ID = ${primitiveId})`;
        }
        // Specifications for the current primitive.

        const primitive = graph.factory.build(children[i], graph.reader, graph.scene);
        if (typeof primitive === 'string') {
            return primitive;
        }
        graph.primitives[primitiveId] = primitive;
    }

    graph.log("Parsed primitives");
    return;
}