import { TextureScaleFactors } from '../../textures/TextureScaleFactors.js'

export function parseTexture(sxsReader, textureNode, id, type) {
    const getDefaultValues = () => {
        return {
            texture: sxsReader.graph.scene.defaultTexture,
            textureScaleFactor: sxsReader.graph.scene.defaultTextureScaling
        }
    }

    if (textureNode == null) {
        sxsReader.graph.onXMLMinorError(`No texture tag defined for ${type} with ID = ${id}, using default texture`);
        return getDefaultValues();
    }


    let texture = undefined;
    let length_s, length_t = undefined;
    texture = sxsReader.reader.getString(textureNode, 'id');
    if (texture === null) {
        sxsReader.graph.onXMLMinorError(`No ID defined for ${type} with ID = ${id}, using default texture`);
        texture = sxsReader.graph.scene.defaultTexture;
    }

    if (texture == 'none') {
        return {
            texture: 'none',
            textureScaleFactor: sxsReader.graph.scene.defaultTextureScaling
        };
    }

    length_s = sxsReader.reader.getFloat(textureNode, 'length_s', false);
    if (length_s === null || length_s < 0) {
        sxsReader.graph.onXMLMinorError(`No length_s defined for ${type} with ID = ${id}, using default value`);
        length_s = 1;
    }
    length_t = sxsReader.reader.getFloat(textureNode, 'length_t', false);
    if (length_t === null || length_t < 0) {
        sxsReader.graph.onXMLMinorError(`No length_t defined for ${type} with ID = ${id}, using default value`);
        length_t = 1;
    }
    const textureScaleFactor = new TextureScaleFactors(length_s, length_t);

    if (texture === 'inherit') {
        return {
            texture: texture,
            textureScaleFactor: textureScaleFactor
        };

    }

    const textures = sxsReader.attributes.get('textures');
    if (!texture in textures) {
        texture = sxsReader.scene.defaultTexture;
    } else {
        texture = textures.filter(tex => tex.id == texture)[0];
    }

    return {
        texture: texture,
        textureScaleFactor: textureScaleFactor
    };
}
