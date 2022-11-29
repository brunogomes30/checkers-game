import { TextureScaleFactors } from '../../textures/TextureScaleFactors.js'

export function parseTexture(graph, textureNode, id, type) {
    const getDefaultValues = () => {
        return {
            texture: graph.scene.defaultTexture,
            textureScaleFactor: graph.scene.defaultTextureScaling
        }
    }

    if(textureNode == null){
        graph.onXMLMinorError(`No texture tag defined for ${type} with ID = ${id}, using default texture`);
        return getDefaultValues();
    }


    let texture = undefined;
    let length_s, length_t = undefined;
    console.log("textureNode = ", textureNode);
    texture = graph.reader.getString(textureNode, 'id');
    if (texture === null) {
        graph.onXMLMinorError(`No ID defined for ${type} with ID = ${id}, using default texture`);
        texture = graph.scene.defaultTexture;
    }

    if(texture == 'none'){
        return {
            texture: 'none',
            textureScaleFactor: graph.scene.defaultTextureScaling
        };
    }

    length_s = graph.reader.getFloat(textureNode, 'length_s', false);
    if (length_s === null || length_s < 0) {
        graph.onXMLMinorError(`No length_s defined for ${type} with ID = ${id}, using default value`);
        length_s = 1;
    }
    length_t = graph.reader.getFloat(textureNode, 'length_t', false);
    if (length_t === null || length_t < 0) {
        graph.onXMLMinorError(`No length_t defined for ${type} with ID = ${id}, using default value`);
        length_t = 1;
    }
    const textureScaleFactor = new TextureScaleFactors(length_s, length_t);
    return {
        texture: texture,
        textureScaleFactor: textureScaleFactor
    };
}