import { parseTransformationOperations } from "./common.js"
import { MyKeyframeAnimation } from "../animations/MyKeyframeAnimation.js"

export function parseAnimations(animationsNode, graph) {
    graph.animations = [];
    // Any number of animations.
    for (let animation of animationsNode.children) {

        if (animation.nodeName != "keyframeanim") {
            graph.onXMLMinorError("unknown tag <" + animation.nodeName + ">");
            continue;
        }

        // Get id of the current transformation.
        let animationID = graph.reader.getString(animation, 'id');
        if (animationID == '')
            return "no ID defined for animation";

        if (animationID == 'none')
            return "'none' is not a valid ID for an animation";

        // Checks for repeated IDs.
        if (animationID in graph.animations)
            return "ID must be unique for each animation (conflict: ID = " + animationID + ")";


        // Specifications for the current transformation.
        const keyframes = parseKeyframeAnimation(animation, graph, "ID " + animationID, true);

        if (typeof (keyframes) == 'string') {
            return keyframes;
        }
        graph.animations[animationID] = new MyKeyframeAnimation(graph.scene, animationID, keyframes);

    }

    graph.log("Parsed animations");
    return null;
}

const transformationOperationsOrder = ['translation', 'rotation', 'rotation', 'rotation', 'scale'];
const rotationOperationsOrder = ['z', 'y', 'x'];
export function parseKeyframeAnimation(animationNode, graph, errorMsg) {
    if (animationNode.children.length < 1) {
        return "no keyframes defined for animation " + errorMsg;
    }

    let keyframes = []
    let lastInstant = null;
    for (let keyframe = 0; keyframe < animationNode.children.length; keyframe++) {
        let instant = graph.reader.getFloat(animationNode.children[keyframe], 'instant', false);
        if (!(instant != null && !isNaN(instant))) {
            return "unable to parse keyframe instant of animation with " + errorMsg;
        }

        if (lastInstant != null && instant <= lastInstant) {
            return "keyframe instant must be greater than the previous one; error in animation with " + errorMsg;
        }
        lastInstant = instant;

        let animNode = [];

        for (let operationIndex = 0; operationIndex < transformationOperationsOrder.length; operationIndex++) {
            if (animationNode.children[keyframe].children.length < operationIndex + 1) {
                return "missing " + transformationOperationsOrder[operationIndex] + " tag for keyframe of animation with " + errorMsg;
            }

            const operation = animationNode.children[keyframe].children[operationIndex];
            if (!transformationOperationsOrder.includes(operation.nodeName)) {
                return "unknown tag <" + operation.nodeName + "> for keyframe of animation with " + errorMsg;
            }

            if (operation.nodeName != transformationOperationsOrder[operationIndex]) {
                return "incorrect tag order for keyframe of animation with " + errorMsg + "; expected " + transformationOperationsOrder[operationIndex] + " but got " + operation.nodeName;
            }

            if (operation.nodeName == 'rotation') {
                let axis = graph.reader.getString(operation, 'axis', false);
                if (axis != rotationOperationsOrder[operationIndex - 1]) {
                    return "invalid rotation axis order for rotation tag in animation with " + errorMsg + "; expected " + rotationOperationsOrder[operationIndex - 1] + " but got " + axis;
                }
            }

            let matrix = parseTransformationOperations(graph, operation, "component of keyframe animation with " + errorMsg, true);
            if (typeof matrix == 'string')
                return matrix;
            animNode.push(matrix);
        }

        keyframes[instant] = animNode;
    }

    return keyframes;
}
