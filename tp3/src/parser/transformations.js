import { parseTransformationOperations } from "./common.js"

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

        const operation = transformationNode.children[operationId];
        switch (operation.nodeName) {
            case 'translate':
            case 'scale':
            case 'rotate':
                let matrix = parseTransformationOperations(graph, operation, "transformation for " + errorMsg);
                if (typeof matrix == 'string')
                    return matrix;

                transfMatrix = mat4.multiply(transfMatrix, transfMatrix, matrix);
                break;

            case 'transformationref':
                if (isInsideTransformationsBlock) {
                    return "Use of tranformation references not allowed inside <transformations> block for " + errorMsg;
                }

                if (transformationNode.children.length > 1) {
                    return "Can't use of multiple tranformation references, combination of tranformation references and directives, or both inside <tranformation> block of <component> block for " + errorMsg;
                }

                let transformationID = graph.reader.getString(operation, 'id');
                if (transformationID == '')
                    return "no ID defined for transformation for" + errorMsg;

                if (!(transformationID in graph.transformations)) {
                    graph.onXMLMinorError(`Unable to find transformation with ID '${transformationID}' in component '${errorMsg}'`);
                    return mat4.create();
                }

                return graph.transformations[transformationID];
        }

    }

    return transfMatrix;
}
