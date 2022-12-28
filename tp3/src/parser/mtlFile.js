import { CGFappearance } from "../../../lib/CGF.js";

export function parseMaterialFile(scene, filePath, textures) {
    const PATH = 'scenes/models/';
    const filepath = PATH + filePath;
    const objFile = new XMLHttpRequest();
    objFile.open('GET', filepath, false);
    objFile.send(null);
    if (objFile.status === 200) {
        const allTextLines = objFile.responseText;
        const materials = parseMaterial(scene, allTextLines, textures);
        return materials;
    }
    else {
        return "Error loading file: " + filepath;
    }
}

function parseMaterial(scene, data, textures) {
    const lines = data.split("\n");
    const materials = {};
    let materialId; // newmtl
    let ambient; // Ns
    let diffuse; // Kd
    let specular; // Ks
    let shininess; // Ks
    let emission; // Ke
    let transparency; // d
    let illumination; // illum
    let textureId; // map_Kd


    const initMaterial = () => {
        materialId = undefined;
        ambient = [];
        diffuse = [];
        specular = [];
        shininess = undefined;
        emission = [];
        transparency = undefined;
        illumination = undefined;
        textureId = undefined;
    }

    const saveMaterial = () => {
        const material = new CGFappearance(scene);
        material.setAmbient(diffuse[0], diffuse[1], diffuse[2], transparency);
        material.setDiffuse(diffuse[0], diffuse[1], diffuse[2], transparency);
        material.setSpecular(specular[0], specular[1], specular[2], transparency);
        material.setShininess(1.0);
        material.setEmission(emission[0], emission[1], emission[2], transparency);
        //material.setIllumination(illumination);
        materials[materialId] = material;
        if(textureId != undefined){
            const texturesFound = textures.filter(texture => texture.id == textureId);
            if(texturesFound.length == 0){
                console.warn("Couldn't find texture with id " + textureId  + " for model");
            } else {
                const texture = texturesFound[0];
                material.setTexture(texture.texture);
            }
        }
    }
    initMaterial();



    const parseNewMaterial = (line) => {
        if (materialId !== undefined) {
            saveMaterial();
        }
        initMaterial();
        materialId = line[1];
    };

    const parseDiffuse = (line) => {
        const valuesStr = line.slice(1);
        diffuse = valuesStr.map((value) => parseFloat(value));
    };

    const parseSpecular = (line) => {
        const valuesStr = line.slice(1);
        specular = valuesStr.map((value) => parseFloat(value));
    };

    const parseAmbient = (line) => {
        const valuesStr = line.slice(1);
        ambient = valuesStr.map((value) => parseFloat(value));
        //ambient = [0.1, 0.1, 0.1];
    };

    const parseEmission = (line) => {
        const valuesStr = line.slice(1);
        emission = valuesStr.map((value) => parseFloat(value));
    };

    const parseTransparency = (line) => {
        transparency = parseFloat(line[1]);
    };

    const parseIllumination = (line) => {
        illumination = parseInt(line[1]);
    };


    const parseTexture = (line) => {
        const absolutePath = line[1]; //Used in blender, but ignored here

        //Texture id should appear after a absolute path and comment.
        // map_Kd C:\\Users\\ultra\\Downloads\\camo.jpg # textureId
        if(line.length > 2){
            const idIndex = line.findIndex(value => value == '#') + 1;
            //Get id of texture after comment
            textureId = line[idIndex];
        }
    }

    const ignoreLine = (line) => {
        // do nothing
    };

    const parsers = {
        'newmtl': parseNewMaterial,
        'Ka': parseAmbient,
        'Kd': parseDiffuse,
        'Ks': parseSpecular,
        'Ke': parseEmission,
        'Ni': ignoreLine, //Optical density
        'Ns' : ignoreLine,
        'd': parseTransparency,
        'illum': parseIllumination,
        'map_Kd': parseTexture,
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("#")) {
            continue;
        }
        const coords = line.split(" ");
        const parser = parsers[coords[0]];
        if (parser) {
            parser(coords);
        } else {
            console.warn('Unknown line: ' + line);
        }
    }
    saveMaterial();
    return materials;
}
