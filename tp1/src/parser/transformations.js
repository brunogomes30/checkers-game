import {parseCoordinates3D, parseCoordinates4D, parseColor} from "./utils.js"

/**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
export function parseTransformations(transformationsNode, graph) {
    var children = transformationsNode.children;

    graph.transformations = [];

    var grandChildren = [];

    // Any number of transformations.
    for (let i = 0; i < children.length; i++) {

        if (children[i].nodeName != "transformation") {
            graph.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }

        // Get id of the current transformation.
        let transformationID = graph.reader.getString(children[i], 'id');
        if (transformationID == null)
            return "no ID defined for transformation";

        // Checks for repeated IDs.
        if (graph.transformations[transformationID] != null)
            return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

        grandChildren = children[i].children;
        // Specifications for the current transformation.

        let transfMatrix = mat4.create();

        for (let j = 0; j < grandChildren.length; j++) {
            switch (grandChildren[j].nodeName) {
                case 'translate':
                    var coordinates = parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID, graph);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                    break;
                case 'scale':                        
                    graph.onXMLMinorError("To do: Parse scale transformations.");
                    break;
                case 'rotate':
                    // angle
                    graph.onXMLMinorError("To do: Parse rotate transformations.");
                    break;
            }
        }
        graph.transformations[transformationID] = transfMatrix;
    }

    graph.log("Parsed transformations");
    return null;
}