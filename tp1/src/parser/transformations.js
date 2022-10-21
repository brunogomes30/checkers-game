import { degToRad } from "../primitives/geometryUtils.js";
import { parseCoordinates3D } from "./utils.js"

/**
 * Parses the <transformations> block.
 * @param {XMLNode} transformationsNode - The transformations block element.
 */
export function parseTransformations(transformationsNode, graph) {
    graph.transformations = [];

    // Any number of transformations.
    for (let transformation of transformationsNode.children) {

        if (transformation.nodeName != "transformation") {
            graph.onXMLMinorError("unknown tag <" + transformation.nodeName + ">");
            continue;
        }

        // Get id of the current transformation.
        let transformationID = graph.reader.getString(transformation, 'id');
        if (transformationID == '')
            return "no ID defined for transformation";

        // Checks for repeated IDs.
        if (transformationID in graph.transformations)
            return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";


        // Specifications for the current transformation.
        const matrix = parseTransformation(transformation, graph, "ID " + transformationID, true);

        if (typeof (matrix) == 'string') {
            return matrix;
        }
        graph.transformations[transformationID] = matrix;
    }

    graph.log("Parsed transformations");
    return null;
}

/**
 * Parses the <transformation> block.
 * @param {XMLNode} transformationNode
 * @param {MySceneGraph} graph
 * @param {String} errorMsg
 * @param {Boolean} isInsideTransformationsBlock
 * @returns {mat4} transformation matrix or {String} error message if error occurs 
 */
export function parseTransformation(transformationNode, graph, errorMsg, isInsideTransformationsBlock) {
    let transfMatrix = mat4.create();

    for (let operationId = 0; operationId < transformationNode.children.length; operationId++) {
        let coordinates;
        const operation = transformationNode.children[operationId];
        switch (operation.nodeName) {
            case 'translate':
                coordinates = parseCoordinates3D(operation, "translate transformation for " + errorMsg, graph);
                if (!Array.isArray(coordinates))
                    return coordinates;

                transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                break;

            case 'scale':
                coordinates = parseCoordinates3D(operation, "scale transformation for " + errorMsg, graph);
                if (!Array.isArray(coordinates))
                    return coordinates;
                transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates)
                break;

            case 'rotate':
                let angle = graph.reader.getFloat(operation, "angle");
                if (!(angle != null && !isNaN(angle))) {
                    return "unable to parse angle of the rotation transformation for " + errorMsg;
                }
                angle = degToRad(angle);

                const axis = graph.reader.getItem(operation, "axis", ["x", "y", "z"], true);
                if (axis == null) {
                    return "unable to parse axis of the rotation transformation for " + errorMsg;
                }

                let rotationVec;
                switch (axis) {
                    case 'x':
                        rotationVec = vec3.fromValues(1, 0, 0);
                        break;
                    case 'y':
                        rotationVec = vec3.fromValues(0, 1, 0);
                        break;
                    case 'z':
                        rotationVec = vec3.fromValues(0, 0, 1);
                        break;
                }

                transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle, rotationVec);
                break;

            case 'transformationref':
                if (isInsideTransformationsBlock) {
                    return "Use of tranformation references not allowed inside <transformations> block for " + errorMsg;
                }

                if (transformationNode.children.length > 1) {
                    return "Use of multiple tranformation references, combination of tranformation references and directives, or both inside <tranformation> block of <component> block for " + errorMsg;
                }

                let transformationID = graph.reader.getString(operation, 'id');
                if (transformationID == '')
                    return "no ID defined for transformation for" + errorMsg;

                if (!(transformationID in graph.transformations))
                    return `Unable to find transformation with ID '${transformationID}' in component '${errorMsg}'`

                return graph.transformations[transformationID];
        }

    }

    return transfMatrix;
}
