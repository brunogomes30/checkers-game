import { parseObjFile } from './objFile.js';
import { parseMaterials } from './common/materials.js';
import { parseTexture } from './common/texture.js';


export function parseModels(modelsNode, sxsReader) {
    const children = modelsNode.children;

    const models = [];
    for (let i = 0; i < children.length; i++) {
        const modelNode = children[i];
        const id = sxsReader.reader.getString(modelNode, 'id', false);
        if (id === null) {
            return `No ID defined for model`;
        };

        //Check if is pickable
        let pickable = sxsReader.reader.getBoolean(modelNode, 'pickable', false);
        if(pickable === null){
            pickable = false;
        }
        
        const file = sxsReader.reader.getString(modelNode, 'file', false);
        if (file === null) {
            return `No file defined for model with ID = ${id}`;
        };

        const className = sxsReader.reader.getString(modelNode, 'class', false);

        const model = parseObjFile(sxsReader.graph.scene, file, sxsReader.graph.textures);

        model.setModelClass(className);
        model.setPickable(pickable);
        if(model instanceof String){
            return model;
        }

        const grandChildren = modelNode.children;
        const nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        const modelChildren = modelNode.children;
        for (let j = 0; j < modelChildren.length; j++) {
            const node = modelChildren[j];
            switch (node.nodeName) {
                case 'texture':
                    const { texture, textureScaleFactor } = parseTexture(sxsReader, node, id, 'model');
                    if (texture instanceof String) {
                        return texture;
                    }
                    model.texture = texture;
                    model.textureScaleFactor = textureScaleFactor;
                    break;
                case 'materials':
                    const materials = parseMaterials(sxsReader, node, id, 'model');
                    if (materials instanceof String) {
                        return materials;
                    }
                    model.materials = materials;
                    break;
                case 'object':
                    parseObject(sxsReader, node, model);
                    break;
                default:
                    return `Unknown tag name <${node.nodeName}> in model with ID = ${id}`;
            }
        };

        models[id] = model;

    };

    sxsReader.attributes.set('models', models);
}

function parseObject(sxsReader, objectNode, model) {
    const id = sxsReader.reader.getString(objectNode, 'id', false);
    if (id === null) {
        return `No ID defined for object in model ${model.id}`;
    };

    const object = model.objects[id];
    if (object === undefined) {
        return `Object with ID = ${id} not found in model ${model.id}`;
    }
    const children = objectNode.children;

    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        switch (node.nodeName) {
            case 'texture':
                const { texture, textureScaleFactor } = parseTexture(sxsReader, node, id, 'object');
                if (texture instanceof String) {
                    return texture;
                }
                object.texture = texture;
                object.textureScaleFactor = textureScaleFactor;
                break;
            case 'materials':
                const materials = parseMaterials(sxsReader, node, id, 'object');
                if (materials instanceof String) {
                    return materials;
                }
                object.materials = materials;
                break;

            default:
                return `Unknown tag name <${node.nodeName}> in object with ID = ${id}`;
        }
    };
}
