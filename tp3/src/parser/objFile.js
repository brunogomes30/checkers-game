import { MyModel } from "../primitives/MyModel.js";
import { MyObject } from "../primitives/MyObject.js";
import { MyFragment } from "../primitives/MyFragment.js";
import { parseMaterialFile } from "./mtlFile.js";

function getRelativePath(modelName){
    const splitted = modelName.split('/');
    return splitted.slice(0, splitted.length - 1).join("/");
}

export function parseObjFile(scene, modelName, textures) {
    const PATH = 'scenes/models/';
    const filepath = PATH + modelName;
    const relativePath = getRelativePath(modelName);
    const objFile = new XMLHttpRequest();
    objFile.open('GET', filepath, false);
    objFile.send(null);
    if (objFile.status === 200) {
        const allTextLines = objFile.responseText;
        const model = parseModel(scene, allTextLines, textures, relativePath);
        return model;
    }
    else {
        return "Error loading file: " + filepath;
    }

}



function parseModel(scene, data, textures, relativePath) {
    let lines = data.split("\n");
    let objectId = undefined;
    let materials = [];
    let currentMaterial = undefined;
    const objects = {};
    let verticesValues = [];
    let textureCoords = [];
    let normalsVertices = [];

    let vertexData = {};
    let vertexDataOrder = [];
    let indices = [];
    let fragments = [];

    const saveFragment = () => {
        for (let i = 0; i < indices.length; i++) {
            const id = indices[i];
            indices[i] = vertexData[id].index;
        }

        const texCoords = [];
        const normals = [];
        const vertices = [];
        for (let i = 0; i < vertexDataOrder.length; i++) {
            const key = vertexDataOrder[i];
            const values = key.split("-");
            const vertexIndex = parseInt(values[0]) - 1;
            const texIndex = parseInt(values[1]) - 1;
            const normalIndex = parseInt(values[2]) - 1;
            vertices.push(verticesValues[vertexIndex * 3], verticesValues[vertexIndex * 3 + 1], verticesValues[vertexIndex * 3 + 2]);
            texCoords.push(textureCoords[texIndex * 2], textureCoords[texIndex * 2 + 1]);
            normals.push(normalsVertices[normalIndex * 3], normalsVertices[normalIndex * 3 + 1], normalsVertices[normalIndex * 3 + 2]);
        };
        const fragment = new MyFragment(scene, objectId,
            {
                vertices: vertices,
                indices: indices,
                normals: normals,
                texCoords: texCoords,
                material: currentMaterial
            });
        fragments.push(fragment);
        initFragment();
    }

    const initFragment = () => {
        vertexData = {};
        vertexDataOrder = [];
        indices = [];
        currentMaterial = undefined;
    }

    let initObject = () => {
        fragments = [];
        initFragment();
    }

    const parseMaterialLib = (line) => {
        const materialFilePath = relativePath + '/' + line[1];
        materials = parseMaterialFile(scene, materialFilePath, textures);
    }

    const useMaterial = (line) => {
        const materialName = line[1];
        if (vertexDataOrder.length > 0) {
            saveFragment();
        }
        currentMaterial = materials[materialName];

    }
    const finishObject = () => {
        if (verticesValues.length > 0) {
            saveFragment();
            const model = new MyObject(scene, objectId,
                {
                    fragments: fragments,
                });
            objects[objectId] = model;
        }
    };

    let lastParsedKey = null;
    const parseVertex = (coords) => {
        verticesValues.push(parseFloat(coords[1]), parseFloat(coords[2]), parseFloat(coords[3]));
    }
    const parseTexture = (coords) => {
        textureCoords.push(parseFloat(coords[1]), parseFloat(coords[2]));
    }
    const parseNormal = (coords) => {
        normalsVertices.push(parseFloat(coords[1]), parseFloat(coords[2]), parseFloat(coords[3]));
    }
    const parseObject = (value) => {
        if (lastParsedKey === 'f') {
            finishObject();
            initObject();
        }
        objectId = value[1];
    }
    const parseFace = (coords) => {
        for (let i = 1; i < coords.length; i++) {
            const face = coords[i].split("/");
            const values = [];
            face.forEach((value, i) => {
                values.push(parseInt(value));
            });
            const id = values.join("-");
            if (vertexData[id] == null) {
                const normalIndex = parseInt(face[2]) - 1;
                const texIndex = parseInt(face[1]) - 1;
                vertexData[id] = {
                    'index': vertexDataOrder.length,
                    "texCoords": [textureCoords[texIndex * 2], textureCoords[texIndex * 2 + 1]],
                    "normals": [normalsVertices[normalIndex * 3], normalsVertices[normalIndex * 3 + 1], normalsVertices[normalIndex * 3 + 2]]
                };
                vertexDataOrder.push(id);
            }
            const vertexIndex = parseInt(face[0]) - 1;
            indices.push(id);

            if (vertexData[vertexIndex] == undefined) {

            }

            //faces.push(parseInt(coords[3]), parseInt(coords[2]), parseInt(coords[1]));
        }
    };

    let parsers = {
        'mtllib': parseMaterialLib,
        "v": parseVertex,
        "vt": parseTexture,
        "vn": parseNormal,
        "f": parseFace,
        "o": parseObject,
        "usemtl": useMaterial,
        "s": () => { /*  Do nothing */ },
    };


    for (let nline = 0; nline < lines.length; nline++) {
        const line = lines[nline];
        if (line.startsWith("#")) {
            continue;
        }
        const coords = line.split(" ");
        const parser = parsers[coords[0]];
        if (!parser) {
            console.warn("Unknown line in .obj file: " + line);
            continue
        }
        parser(coords);
        lastParsedKey = coords[0];
    }
    finishObject();
    return new MyModel(scene, objects);
}
