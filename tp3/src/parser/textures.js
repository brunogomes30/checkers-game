import { Texture } from "../textures/Texture.js"
/**
 * Parses the <textures> block. 
 * @param {XMLNode} texturesNode - The textures block element.
 * @param {MySceneGraph} sxsReader - The scene graph.
 */
export function parseTextures(texturesNode, sxsReader) {
    let textures = []
    //For each texture in textures block, check ID and file URL
    for (let texture of texturesNode.children) {
        if (texture.nodeName != "texture") {
            sxsReader.graph.onXMLMinorError("unknown tag <" + texture.nodeName + ">");
            continue;
        }

        const textureID = sxsReader.reader.getString(texture, 'id');
        if (textureID == '')
            return "no ID defined for texture";

        const textureURL = sxsReader.reader.getString(texture, 'file');
        if (textureURL == '')
            return "no file defined for texture " + textureID;

        if (textureID in textures)
            return "ID must be unique for each teture (conflict: ID = " + textureID + ")";

        textures.push(new Texture(textureID, sxsReader.graph.scene, textureURL))
    }

    sxsReader.graph.log("Parsed textures");
    sxsReader.attributes.set('textures', textures);

    return null;
}
