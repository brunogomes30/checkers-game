/**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
export function parseScene(sceneNode, graph) {
    // Get root of the scene.
    var root = graph.reader.getString(sceneNode, 'root')
    if (root == null)
        return "no root defined for scene";

    graph.idRoot = root;

    // Get axis length        
    var axis_length = graph.reader.getFloat(sceneNode, 'axis_length');
    if (axis_length == null)
        graph.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

    graph.referenceLength = axis_length || 1;

    graph.log("Parsed scene");

    return null;
}