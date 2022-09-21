import { PrimitiveFactory } from '../factory/PrimitiveFactory.js';
import { MyRectangle } from '../primitives/MyRectangle.js';

/**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
export function parsePrimitives(primitivesNode, graph) {
    var children = primitivesNode.children;
    graph.primitives = [];

    // Any number of primitives.
    for (var i = 0; i < children.length; i++) {

        if (children[i].nodeName != "primitive") {
            graph.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }

        // Get id of the current primitive.
        let primitiveId = graph.reader.getString(children[i], 'id');
        if (primitiveId == null)
            return "no ID defined for texture";

        // Checks for repeated IDs.
        if (graph.primitives[primitiveId] != null)
            return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";
        // Specifications for the current primitive.
        
        const primitive = graph.factory.build(children[i], graph.reader, graph.scene);
        
        graph.primitives[primitiveId] = primitive;        
    }

    graph.log("Parsed primitives");
    return null;
}