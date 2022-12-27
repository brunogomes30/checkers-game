/**
 * Parses the <scene> block. 
 * @param {XMLNode} sceneNode - The scene block element.
 * @param {MySceneGraph} sxsReader - The scene graph.
 */
export function parseScene(sceneNode, sxsReader) {
    // Get root of the scene.
    var root = sxsReader.reader.getString(sceneNode, 'root', false)
    if (root == null)
        return "no root defined for scene";

    sxsReader.attributes.set('idRoot', root);

    // Get axis length        
    var axis_length = sxsReader.reader.getFloat(sceneNode, 'axis_length', false);
    if (axis_length == null){
        sxsReader.graph.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");
    }
    if(axis_length <= 0){
        sxsReader.graph.onXMLMinorError("axis_length must be positive; assuming 'length = 1'");
        axis_length = 1;
    }
    sxsReader.attributes.set('referenceLength', axis_length || 1);

    sxsReader.graph.log("Parsed scene tag");

    return null;
}