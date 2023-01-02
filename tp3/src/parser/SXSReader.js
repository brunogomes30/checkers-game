import { parseScene } from './scene.js';
import { parseView } from './view.js';
import { parseAmbient } from './ambient.js';
import { parseLights } from './lights.js';
import { parseTextures } from './textures.js';
import { parseMaterials } from './materials.js';
import { parseTransformations } from './transformations.js';
import { parsePrimitives } from './primitives.js';
import { parseAnimations } from './animations.js';
import { parseComponents } from './components.js';
import { parseModels } from './models.js';
import { parseSXSInclude } from './sxs.js';
import { CGFXMLreader } from '../../../lib/CGF.js';

const PARSE_FUNCTION = {
    'scene': parseScene,
    'views': parseView,
    'ambient': parseAmbient,
    'lights': parseLights,
    'textures': parseTextures,
    'materials': parseMaterials,
    'transformations': parseTransformations,
    'primitives': parsePrimitives,
    'animations': parseAnimations,
    'models': parseModels,
    'components': parseComponents,
    'includeSXS': parseSXSInclude
}

// Order of the groups in the XML document.
const XML_SEQUENCE_POSITION = {
    'scene': 0,
    'views': 1,
    'ambient': 2,
    'lights': 3,
    'textures': 4,
    'materials': 5,
    'transformations': 6,
    'primitives': 7,
    'animations': 8,
    'models': 9,
    'components': 10,
}

export class SXSReader {
    constructor(graph, filename, mainFile = false) {
        this.graph = graph;
        this.filename = filename;
        this.mainFile = mainFile;
        this.reader = new CGFXMLreader();
        this.parsed = false;
        this.attributes = new Map();
    }

    open() {
        this.reader.open('scenes/' + this.filename, this);
    }

    onXMLReady() {
        this.parseSXSFile();
    }

    onXMLError(message) {
        this.error = true;
        this.graph.onXMLError(message);
    }

    parseSXSFile() {
        let rootElement = this.reader.xmlDoc.documentElement;
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        let nodes = rootElement.children;
        let parsable_blocks = Object.keys(PARSE_FUNCTION);


        for (let i = 0; i < nodes.length; i++) {
            let nodeName = nodes[i].nodeName;

            if (!(parsable_blocks.includes(nodeName))) {
                if ((nodeName in PARSE_FUNCTION)) {
                    this.graph.onXMLMinorError(`More than one <${nodeName}> block was detected, only the first one declared is considered`);
                }
                continue;
            }

            if (this.mainFile === false) {
                if (nodeName === 'scene' || nodeName === 'ambient' || nodeName === 'includeSXS') {
                    this.graph.onXMLMinorError(`The <${nodeName}> block is not allowed in an included file ${this.filename}; Ignoring it`);
                    continue;
                }
            }

            let error;
            if (nodeName in PARSE_FUNCTION && ((error = PARSE_FUNCTION[nodeName](nodes[i], this)) != null)) {
                this.graph.onXMLError(error);
                return;
            }
        }

        this.parsed = true;

        if (this.mainFile === true) {
            this.graph.onXMLReady();
        }
    }

    async updateGraph() {
        const blocks_missing = Object.keys(XML_SEQUENCE_POSITION);
        for (const attribute of this.attributes) {
            switch (attribute[0]) {
                case 'idRoot':
                    blocks_missing.splice(blocks_missing.indexOf('scene'), 1);
                    if (this.graph.idRoot != null) {
                        this.graph.onXMLMinorError(`Root already defined as ${this.graph.idRoot}, ignoring ${attribute[1]}`);
                        break;
                    }
                    this.graph.idRoot = attribute[1];
                    break;

                case 'ambient':
                    blocks_missing.splice(blocks_missing.indexOf('ambient'), 1);
                    this.graph.ambient = attribute[1];
                    break;

                case 'defaultCameraId':
                    if (this.graph.defaultCameraId != null) {
                        this.graph.onXMLMinorError(`Default camera already defined as ${this.graph.defaultCameraId}, ignoring ${attribute[1]}`);
                        break;
                    }

                    this.graph[attribute[0]] = attribute[1];
                    break;

                case 'background':
                case 'referenceLength':
                    this.graph[attribute[0]] = attribute[1];
                    break;

                case 'cameras':
                    blocks_missing.splice(blocks_missing.indexOf('views'), 1);
                    for (const camera in attribute[1]) {
                        if (camera in this.graph.cameras) {
                            this.graph.onXMLMinorError(`Camera with ID ${camera} already defined`)
                            continue;
                        }

                        this.graph.cameras[camera] = attribute[1][camera]
                    }
                    break;

                case 'lights':
                case 'materials':
                case 'transformations':
                case 'primitives':
                case 'animations':
                case 'models':
                case 'components':
                    blocks_missing.splice(blocks_missing.indexOf(attribute[0]), 1);
                    
                    for (const value of Object.keys(attribute[1])) {
                        if (value in this.graph[attribute[0]]) {
                            this.graph.onXMLMinorError(`${attribute[0]} with ID ${value} already defined`)
                            continue;
                        }
                        this.graph[attribute[0]][value] = attribute[1][value];
                    }
                    break;
                case 'class_components':
                    for (const value of Object.keys(attribute[1])) {
                        if (value in this.graph.class_components) {
                            this.graph.class_components[value].push(...attribute[1][value]);
                        } else {
                            this.graph.class_components[value] = attribute[1][value];
                        }
                    }
                    break;
                case 'textures':
                    blocks_missing.splice(blocks_missing.indexOf('textures'), 1);
                    for (const texture of attribute[1]) {
                        const textures = this.graph.textures.filter(tex => tex.id == texture.id);
                        if (textures.length != 0) {
                            this.graph.onXMLMinorError(`texture with ID ${texture.id} already defined`)
                            continue;
                        }
                        this.graph['textures'].push(texture);
                    }
                    break;

                case 'enabledLights':
                    for (const light of Object.keys(attribute[1])) {
                        if (light in this.graph.enabledLights) {
                            continue;
                        }
                        this.graph.enabledLights[light] = attribute[1][light];
                    }
                    break;
                case 'class_lights':
                    for (const value of Object.keys(attribute[1])) {
                        if (value in this.graph.class_lights) {
                            this.graph.class_lights[value].push(...attribute[1][value]);
                        } else {
                            this.graph.class_lights[value] = attribute[1][value];
                        }
                    }
                    break;

                case 'class_cameras':
                    for (const value of Object.keys(attribute[1])) {
                        if (value in this.graph.class_cameras) {
                            this.graph.class_cameras[value].push(...attribute[1][value]);
                        } else {
                            this.graph.class_cameras[value] = attribute[1][value];
                        }
                    }
                    break;

                default:
                    break;
            }

        }

        if (this.mainFile) {
            if (blocks_missing.length > 0) {
                this.graph.onXMLError(`Blocks missing: ${blocks_missing.toString()}`);
                return;
            }

            for (; ;) {
                let ready = true;
                for (const reader of this.graph.helperReaders) {
                    if (reader.error) {
                        this.graph.onXMLError(`Error in included file ${reader.filename}`);
                        return;
                    }

                    if (reader.parsed === false) {
                        await new Promise((resolve) => {setTimeout(resolve, 800);});
                        ready = false;
                        break;
                    }
                }
                if (ready === true) {
                    break;
                }
            }

            for (const reader of this.graph.helperReaders) {
                reader.updateGraph();
            }
        }
    }

}

