import { MyModel } from "../primitives/MyModel.js";

export function parseObjFile(scene, modelname) {
    const PATH = 'scenes/models/';
    const filepath = PATH + modelname;
    console.log(filepath);
    const objFile = new XMLHttpRequest();
    objFile.open('GET', filepath, false);
    objFile.send(null);
    if (objFile.status === 200) {
        const allTextLines = objFile.responseText;
        const model = parseModel(scene, allTextLines);
        return model;
    }
    else {
        return "Error loading file: " + filepath;
    }

}


function parseModel(scene, data) {
    const lines = data.split("\n");
    const verticesValues = [];
    const textureCoords = [];
    const normalsVertices = [];

    const vertexData = {};
    const vertexDataOrder = [];
    const indices = [];
    const texCoords = [];
    const normals = [];
    const vertices = [];
    const parseVertex = (coords) => {
        verticesValues.push(parseFloat(coords[1]), parseFloat(coords[2]), parseFloat(coords[3]));
    }
    const parseTexture = (coords) => {
        textureCoords.push(parseFloat(coords[1]), parseFloat(coords[2]));
    }
    const parseNormal = (coords) => {
        normalsVertices.push(parseFloat(coords[1]), parseFloat(coords[2]), parseFloat(coords[3]));
    }
    const parseFace = (coords) => {
        for (let i = 1; i < coords.length; i++) {
            const face = coords[i].split("/");
            const values = [];
            face.forEach((value, i) => {
                console.log(1);
                values.push(parseInt(value));
            });
            console.log(values);
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
        "v": parseVertex,
        "vt": parseTexture,
        "vn": parseNormal,
        "f": parseFace
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

    }

    for (let i = 0; i < indices.length; i++) {
        const id = indices[i];
        indices[i] = vertexData[id].index;
    }



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

    return new MyModel(scene, vertices, texCoords, normals, indices);
}
