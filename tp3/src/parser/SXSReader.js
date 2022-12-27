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

export class SXSReader {
    constructor(graph, filename, mainFile = false) {
        this.graph = graph;
        this.filename = filename;
        this.mainFile = mainFile;
        this.reader = new CGFXMLreader();
        this.parsed = false;
        this.attributes = new Map();
    }

    open(){
        this.reader.open('scenes/' + this.filename, this);
    }

    onXMLReady() {
        console.log(this);

        this.parseSXSFile();
    }

    onXMLError(message) {
        this.graph.onXMLError(message);
    }

    parseSXSFile() {
        let rootElement = this.reader.xmlDoc.documentElement;
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        let nodes = rootElement.children;
        let parsable_blocks = Object.keys(PARSE_FUNCTION);

        if (nodes.length > Object.keys(PARSE_FUNCTION).length) {
            this.onXMLMinorError("Extra blocks on the document were't parsed");
        }

        for (let i = 0; i < nodes.length; i++) {
            let nodeName = nodes[i].nodeName;

            if (!(parsable_blocks.includes(nodeName))) {
                if ((nodeName in PARSE_FUNCTION)) {
                    this.graph.onXMLMinorError(`More than one <${nodeName}> block was detected, only the first one declared is considered`);
                }
                continue;
            }

            if (this.mainFile === false){
                if (nodeName === 'scene' || nodeName === 'ambient' || nodeName === 'includeSXS' ) {
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

}

