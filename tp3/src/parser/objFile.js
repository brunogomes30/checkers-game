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
    let textureBegin, normalsBegin, facesBegin;
    //Parse vertices
    for (let nline = 0; nline < lines.length; nline++) {
        const line = lines[nline];
        if (line.startsWith("#")) {
            continue;
        }
        const coords = line.split(" ");
        if (coords[0] == "v") {
            verticesValues.push(parseFloat(coords[1]), parseFloat(coords[2]), parseFloat(coords[3]));
        }
        console.log(line);
        if (line.indexOf("vt") !== -1) {
            textureBegin = nline;
            break;
        }
    }

    //Parse texture coordinates
    const textureCoords = [];
    for (let nline = textureBegin; nline < lines.length; nline++) {
        const line = lines[nline];
        if (line.startsWith("#")) {
            continue;
        }
        const coords = line.split(" ");
        if (coords[0] == "vt") {
            textureCoords.push(parseFloat(coords[1]), parseFloat(coords[2]));
        }
        if (line.indexOf("vn") !== -1) {
            normalsBegin = nline;
            break;
        }
    }

    //Parse normals
    const normalsVertices = [];
    for (let nline = normalsBegin; nline < lines.length; nline++) {
        const line = lines[nline];
        if (line.startsWith("#")) {
            continue;
        }
        const coords = line.split(" ");
        if (coords[0] == "vn") {
            normalsVertices.push(parseFloat(coords[1]), parseFloat(coords[2]), parseFloat(coords[3]));
        }
        if (line.indexOf("f") !== -1) {
            facesBegin = nline;
            break;
        }
    }

    //Parse faces which contain the indices, normals and texture coordinates
    const indices = [];
    const texCoords = [];
    const normals = [];
    const vertexData = {};
    const vertices = [];
    const vertexDataOrder = [];
    for (let nline = facesBegin; nline < lines.length; nline++) {
        const line = lines[nline];
        if (line.startsWith("#") || !line.startsWith("f")) {
            continue;
        }
        const coords = line.split(" ");
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
    }
    for(let i = 0; i < indices.length; i++){
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
