import { parseTransformationOperations } from "./common.js"

/**
 * Parses the <transformations> block.
 * @param {XMLNode} transformationsNode - The transformations block element.
 */
export function parseTransformations(transformationsNode, sxsReader) {
    let transformations = [];

    // Any number of transformations.
    for (let transformation of transformationsNode.children) {

        if (transformation.nodeName != "transformation") {
            sxsReader.graph.onXMLMinorError("unknown tag <" + transformation.nodeName + ">");
            continue;
        }

        // Get id of the current transformation.
        let transformationID = sxsReader.reader.getString(transformation, 'id');
        if (transformationID == '')
            return "no ID defined for transformation";

        // Checks for repeated IDs.
        if (transformationID in transformations)
            return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";


        // Specifications for the current transformation.
        const matrix = parseTransformation(transformation, sxsReader, "ID " + transformationID, true);

        if (typeof (matrix) == 'string') {
            return matrix;
        }
        transformations[transformationID] = matrix;
    }

    sxsReader.graph.log("Parsed transformations");
    sxsReader.attributes.set('transformations', transformations);
    return null;
}

/**
 * Parses the <transformation> block.
 * @param {XMLNode} transformationNode
 * @param {MySceneGraph} sxsReader
 * @param {String} errorMsg
 * @param {Boolean} isInsideTransformationsBlock
 * @returns {mat4} transformation matrix or {String} error message if error occurs 
 */
export function parseTransformation(transformationNode, sxsReader, errorMsg, isInsideTransformationsBlock) {
    let transfMatrix = mat4.create();
    const position = [0, 0, 0];
    for (let operationId = 0; operationId < transformationNode.children.length; operationId++) {

        const operation = transformationNode.children[operationId];
        switch (operation.nodeName) {
            case 'translate':
            case 'scale':
            case 'rotate':
                let results = parseTransformationOperations(sxsReader, operation, "transformation for " + errorMsg); 
                if (typeof results == 'string')
                    return results;
                let matrix = results.matrix;
                position[0] += results.position[0];
                position[1] += results.position[1];
                position[2] += results.position[2];
                

                transfMatrix = mat4.multiply(transfMatrix, transfMatrix, matrix);
                break;

            case 'transformationref':
                if (isInsideTransformationsBlock) {
                    return "Use of tranformation references not allowed inside <transformations> block for " + errorMsg;
                }

                if (transformationNode.children.length > 1) {
                    return "Can't use of multiple tranformation references, combination of tranformation references and directives, or both inside <tranformation> block of <component> block for " + errorMsg;
                }

                let transformationID = sxsReader.reader.getString(operation, 'id');
                if (transformationID == '')
                    return "no ID defined for transformation for" + errorMsg;
                
                return {transformationID};
        }

    }

    return {
        matrix: transfMatrix,
        position: position
    };
}
