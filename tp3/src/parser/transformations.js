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

    for (let operationId = 0; operationId < transformationNode.children.length; operationId++) {

        const operation = transformationNode.children[operationId];
        switch (operation.nodeName) {
            case 'translate':
            case 'scale':
            case 'rotate':
                let matrix = parseTransformationOperations(sxsReader, operation, "transformation for " + errorMsg);
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

                let transformationID = sxsReader.reader.getString(operation, 'id');
                if (transformationID == '')
                    return "no ID defined for transformation for" + errorMsg;
                
                let transformations = sxsReader.attributes.get('transformations')
                if (!(transformationID in transformations)) {
                    sxsReader.graph.onXMLMinorError(`Unable to find transformation with ID '${transformationID}' in component '${errorMsg}'`);
                    return mat4.create();
                }

                return transformations[transformationID];
        }

    }

    return transfMatrix;
}
