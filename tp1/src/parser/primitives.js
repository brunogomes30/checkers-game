import { PrimitiveFactory } from '../factory/PrimitiveFactory.js';
import { MyRectangle } from '../primitives/MyRectangle.js';

/**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
export function parsePrimitives(primitivesNode, graph) {
    var children = primitivesNode.children;

    graph.primitives = [];

    var grandChildren = [];

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
        /*
            var primitiveType = grandChildren[0].nodeName;
            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }
        // Retrieves the primitive coordinates.
        if (primitiveType == 'rectangle') {
            // x1
            var x1 = graph.reader.getFloat(grandChildren[0], 'x1');
            if (!(x1 != null && !isNaN(x1)))
                return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

            // y1
            var y1 = graph.reader.getFloat(grandChildren[0], 'y1');
            if (!(y1 != null && !isNaN(y1)))
                return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

            // x2
            var x2 = graph.reader.getFloat(grandChildren[0], 'x2');
            if (!(x2 != null && !isNaN(x2) && x2 > x1))
                return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

            // y2
            var y2 = graph.reader.getFloat(grandChildren[0], 'y2');
            if (!(y2 != null && !isNaN(y2) && y2 > y1))
                return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

            var rect = new MyRectangle(graph.scene, primitiveId, x1, x2, y1, y2);

            graph.primitives[primitiveId] = rect;
        }
        else {
            console.warn("To do: Parse other primitives.");
        }
        */
        
    }

    graph.log("Parsed primitives");
    return null;
}