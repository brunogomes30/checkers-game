import {parseColor} from "./utils.js"

/**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
 export function parseAmbient(ambientsNode, graph) {

    var children = ambientsNode.children;

    graph.ambient = [];
    graph.background = [];

    var nodeNames = [];

    for (let i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    var ambientIndex = nodeNames.indexOf("ambient");
    var backgroundIndex = nodeNames.indexOf("background");

    var color = parseColor(children[ambientIndex], "ambient", graph);
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