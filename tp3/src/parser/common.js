import { degToRad } from "../primitives/geometryUtils.js";
import { parseCoordinates3D } from "./utils.js"
import { MySceneGraph } from "../MySceneGraph.js";

/**
 * Parses a transformation from a transformation block or from a keyframeanimation block.
 * 
 * @param {MySceneGraph} graph Scene graph
 * @param {XMLNode} operationNode Node with the operation to be parsed
 * @param {string} errorMsg Error message to be displayed
 * @param {boolean} isKeyframe If the operation is part of a keyframe animation description
 * @returns 
 */
export function parseTransformationOperations(graph, operationNode, errorMsg, isKeyframe, params) {
    let parsedOp = mat4.create();
    const acceptsParams = params != undefined;
    let position = [0, 0, 0];
    let coordinates;
    switch (operationNode.nodeName) {
        case 'translate':
        case 'translation':
            coordinates = parseCoordinates3D(operationNode, "translate " + errorMsg, graph, params);
            if (!Array.isArray(coordinates) && (!acceptsParams && !Object.keys(params).includes(coordinates)))
                return coordinates;
            position[0] += coordinates[0];
            position[1] += coordinates[1];
            position[2] += coordinates[2];
            if (isKeyframe) {
                parsedOp = coordinates;
            } else {
                parsedOp = mat4.translate(parsedOp, parsedOp, coordinates);
            }
            break;

        case 'scale':
            coordinates = parseCoordinates3D(operationNode, "scale " + errorMsg, graph, params);
            if (!Array.isArray(coordinates) && (!acceptsParams && !Object.keys(params).includes(coordinates)))
                return coordinates;
            if (isKeyframe) {
                parsedOp = coordinates;
            } else {
                parsedOp = mat4.scale(parsedOp, parsedOp, coordinates);
            }
            break;

        case 'rotate':
        case 'rotation':
            let angle = graph.reader.getFloat(operationNode, "angle");
            if (!(angle != null && !isNaN(angle))) {
                if(acceptsParams){
                    angle = graph.reader.getString(operationNode, 'angle', false);
                    if (angle == undefined || !Object.keys(params).includes(angle)) {
                        return "unable to parse angle of the rotation " + errorMsg;
                    }
                } else {
                    return "unable to parse angle of the rotation " + errorMsg;
                }
            } else {
                angle = degToRad(angle);
            }

            const axis = graph.reader.getItem(operationNode, "axis", ["x", "y", "z"], true);
            if (axis == null) {
                return "unable to parse axis of the rotation " + errorMsg;
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
            if (isKeyframe) {
                parsedOp = [rotationVec, angle];
            } else {
                parsedOp = mat4.rotate(parsedOp, parsedOp, angle, rotationVec);
            }
            break;
    }

    return {
        matrix: parsedOp,
        position: position // Position is the sum of all translates in current component
    };
}
