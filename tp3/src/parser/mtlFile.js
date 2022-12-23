import { CGFappearance } from "../../../lib/CGF.js";

export function parseMaterialFile(scene, filename) {
    const PATH = 'scenes/models/';
    const filepath = PATH + filename;
    const objFile = new XMLHttpRequest();
    objFile.open('GET', filepath, false);
    objFile.send(null);
    if (objFile.status === 200) {
        const allTextLines = objFile.responseText;
        const materials = parseMaterial(scene, allTextLines);
        return materials;
    }
    else {
        return "Error loading file: " + filepath;
    }
}

function parseMaterial(scene, data) {
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


    const initMaterial = () => {
        materialId = undefined;
        ambient = [];
        diffuse = [];
        specular = [];
        shininess = undefined;
        emission = [];
        transparency = undefined;
        illumination = undefined;
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
