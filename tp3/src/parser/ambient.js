import { parseColor } from "./utils.js"

/**
 * Parses the <ambient> node.
 * @param {ambient block element} ambientsNode - The ambient block element.
 * @param {MySceneGraph} sxsReader - The scene graph.
 */
export function parseAmbient(ambientsNode, sxsReader) {

    const children = ambientsNode.children;

    let ambient = [];
    let background = [];

    let nodeNames = [];

    for (let i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    const ambientIndex = nodeNames.indexOf("ambient");
    const backgroundIndex = nodeNames.indexOf("background");

    if(ambientIndex === -1){
        return "ambient block inside ambient not defined";
    }
    let color = parseColor(children[ambientIndex], "ambient", sxsReader);
    if (!Array.isArray(color))
        return color;
    else
        ambient = color;

    if(backgroundIndex === -1){
        return "background block inside ambient not defined";
    }
    color = parseColor(children[backgroundIndex], "background", sxsReader);
    if (!Array.isArray(color))
        return color;
    else
        background = color;

    sxsReader.graph.log("Parsed ambient");

    sxsReader.attributes.set('ambient', ambient);
    sxsReader.attributes.set('background', background);

    return null;
}
