import {parseColor} from "./utils.js"

/**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
 export function parseAmbient(ambientsNode, graph) {

    const children = ambientsNode.children;

    graph.ambient = [];
    graph.background = [];

    let nodeNames = [];

    for (let i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    const ambientIndex = nodeNames.indexOf("ambient");
    const backgroundIndex = nodeNames.indexOf("background");

    let color = parseColor(children[ambientIndex], "ambient", graph);
    if (!Array.isArray(color))
        return color;
    else
        graph.ambient = color;

    color = parseColor(children[backgroundIndex], "background", graph);
    if (!Array.isArray(color))
        return color;
    else
        graph.background = color;

    graph.log("Parsed ambient");

    return null;
}
