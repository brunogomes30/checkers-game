import { Texture } from "../textures/Texture.js"
/**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
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

    graph.log("Parsed textures");
    
    return null;
}
