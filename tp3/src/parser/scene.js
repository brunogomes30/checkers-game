/**
 * Parses the <scene> block. 
 * @param {XMLNode} sceneNode - The scene block element.
 * @param {MySceneGraph} graph - The scene graph.
 */
export function parseScene(sceneNode, graph) {
    // Get root of the scene.
    var root = graph.reader.getString(sceneNode, 'root', false)
    if (root == null)
        return "no root defined for scene";

    graph.idRoot = root;

    // Get axis length        
    var axis_length = graph.reader.getFloat(sceneNode, 'axis_length', false);
    if (axis_length == null){
        graph.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");
    }
    if(axis_length <= 0){
        graph.onXMLMinorError("axis_length must be positive; assuming 'length = 1'");
        axis_length = 1;
    }
    graph.referenceLength = axis_length || 1;

    graph.log("Parsed scene");

    return null;
}