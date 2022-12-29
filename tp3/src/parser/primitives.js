/**
 * Parses the <primitives> block.
 * @param {XMLNode} primitivesNode - The primitives block element.
 * @param {MySceneGraph} sxsReader - The scene graph.
 */
export function parsePrimitives(primitivesNode, sxsReader) {
    const children = primitivesNode.children;
    if (children.length == 0) {
        return 'No primitives defined'
    }

    let primitives = [];

    // Any number of primitives.
    for (let i = 0; i < children.length; i++) {

        if (children[i].nodeName != "primitive") {
            sxsReader.graph.onXMLMinorError(`unknown tag <${children[i].nodeName}>`);
            continue;
        }

        // Get id of the current primitive.
        const primitiveId = sxsReader.reader.getString(children[i], 'id');
        if (primitiveId == null || primitiveId == '') {
            return "no ID defined for primitive in <primitives> block";
        }

        // Checks for repeated IDs.
        if (primitives[primitiveId] != null) {
            return `ID must be unique for each primitive (conflict: ID = ${primitiveId})`;
        }
        // Specifications for the current primitive.

        const primitive = sxsReader.graph.factory.build(children[i], sxsReader.reader, sxsReader.graph.scene);
        if (typeof primitive === 'string') {
            return primitive;
        }
        primitives[primitiveId] = primitive;
    }

    sxsReader.graph.log("Parsed primitives");
    sxsReader.attributes.set('primitives', primitives);
    return;
}