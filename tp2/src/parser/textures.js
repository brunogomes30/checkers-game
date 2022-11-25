import { Texture } from "../textures/Texture.js"
/**
 * Parses the <textures> block. 
 * @param {XMLNode} texturesNode - The textures block element.
 * @param {MySceneGraph} graph - The scene graph.
 */
export function parseTextures(texturesNode, graph) {
    graph.textures = []
    //For each texture in textures block, check ID and file URL
    for (let texture of texturesNode.children) {
        if (texture.nodeName != "texture") {
            graph.onXMLMinorError("unknown tag <" + texture.nodeName + ">");
            continue;
        }

        const textureID = graph.reader.getString(texture, 'id');
        if (textureID == '')
            return "no ID defined for texture";

        const textureURL = graph.reader.getString(texture, 'file');
        if (textureURL == '')
            return "no file defined for texture " + textureID;

        if (textureID in graph.textures)
            return "ID must be unique for each teture (conflict: ID = " + textureID + ")";

        graph.textures.push(new Texture(textureID, graph.scene, textureURL))
    }

    for(let i=0; i<graph.textures.length; i++){
        const texture = graph.textures[i];
        graph.scene.textures[texture.id] = texture.texture;
    }
    graph.log("Parsed textures");

    return null;
}
