import { parseTransformationOperations } from "./common.js"
import { MyKeyframeAnimation } from "../animations/MyKeyframeAnimation.js"

/**
 * Parses a keyframe animations from a animations block.
 * 
 * @param {MySceneGraph} sxsReader Scene graph
 * @param {XMLNode} animationNode Node with the animations to be parsed
 */
export function parseAnimations(animationsNode, sxsReader) {
    let animations = [];

    // Any number of animations.
    for (let animation of animationsNode.children) {

        if (animation.nodeName != "keyframeanim") {
            sxsReader.graph.onXMLMinorError("unknown tag <" + animation.nodeName + ">");
            continue;
        }

        // Get id of the current transformation.
        let animationID = sxsReader.reader.getString(animation, 'id');
        if (animationID == '')
            return "no ID defined for animation";

        if (animationID == 'none')
            return "'none' is not a valid ID for an animation";

        // Checks for repeated IDs.
        if (animationID in animations)
            return "ID must be unique for each animation (conflict: ID = " + animationID + ")";


        // Specifications for the current transformation.
        const keyframes = parseKeyframeAnimation(animation, sxsReader, "ID " + animationID, true);

        if (typeof (keyframes) == 'string') {
            return keyframes;
        }
        animations[animationID] = new MyKeyframeAnimation(sxsReader.graph.scene, animationID, keyframes);

    }

    sxsReader.graph.log("Parsed animations");
    sxsReader.attributes.set('animations', animations);
    return null;
}

/**
 * Order of transformations in the keyframe animation block
 */
const transformationOperationsOrder = ['translation', 'rotation', 'rotation', 'rotation', 'scale'];

/**
 * Order of the rotation axis in the keyframe animation block
 */
const rotationOperationsOrder = ['z', 'y', 'x'];

/**
 * Parses a keyframe keyframeanim from a animations block.
 * 
 * @param {XMLNode} Node with the animation to be parsed
 * @param {MySceneGraph} sxsReader Scene graph
 * @param {string} errorMsg Error message to be displayed in case of error
 */
export function parseKeyframeAnimation(animationNode, sxsReader, errorMsg) {
    // Chck if animation has any keyframes defined
    if (animationNode.children.length < 1) {
        return "no keyframes defined for animation " + errorMsg;
    }

    let keyframes = []
    let lastInstant = null;
    // Iterate over the keyframes and parse them
    for (let keyframe = 0; keyframe < animationNode.children.length; keyframe++) {
        if (animationNode.children[keyframe].nodeName != "keyframe") {
            return "unknown tag <" + animationNode.children[keyframe].nodeName + ">; error in animation with " + errorMsg;
        }

        let instant = sxsReader.reader.getFloat(animationNode.children[keyframe], 'instant', false);
        if (!(instant != null && !isNaN(instant))) {
            return "unable to parse keyframe instant of animation with " + errorMsg;
        }

        if (lastInstant != null && instant <= lastInstant) {
            return "keyframe instant must be greater than the previous one; error in animation with " + errorMsg;
        }
        lastInstant = instant;

        let keyframe_description = [];

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
                let axis = sxsReader.reader.getString(operation, 'axis', false);
                if (axis != rotationOperationsOrder[operationIndex - 1]) {
                    return "invalid rotation axis order for rotation tag in animation with " + errorMsg + "; expected " + rotationOperationsOrder[operationIndex - 1] + " but got " + axis;
                }
            }

            let matrix = parseTransformationOperations(sxsReader, operation, "component of keyframe animation with " + errorMsg, true);
            if (typeof matrix == 'string')
                return matrix;
            
            keyframe_description.push(matrix);
        }

        keyframes[instant] = keyframe_description;
    }

    return keyframes;
}
