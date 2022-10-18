import { CGFXMLreader } from '../../lib/CGF.js';
import { parseScene } from './parser/scene.js';
import { parseView } from './parser/view.js';
import { parseAmbient } from './parser/ambient.js';
import { parseLights } from './parser/lights.js';
import { parseTextures } from './parser/textures.js';
import { parseMaterials } from './parser/materials.js';
import { parseTransformations } from './parser/transformations.js';
import { parsePrimitives } from './parser/primitives.js';
import { parseComponents } from './parser/components.js';
import { PrimitiveFactory } from './factory/PrimitiveFactory.js';
import { renderElement } from './components/renderElement.js';

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
    'components': 8
}

const PARSE_FUNCTION = {
    'scene': parseScene,
    'views': parseView,
    'ambient': parseAmbient,
    'lights': parseLights,
    'textures': parseTextures,
    'materials': parseMaterials,
    'transformations': parseTransformations,
    'primitives': parsePrimitives,
    'components': parseComponents
}

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();
        this.factory = new PrimitiveFactory(this.reader);
        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");

        // Here should go the calls for different functions to parse the various blocks
        this.parseXMLFile();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile() {
        let rootElement = this.reader.xmlDoc.documentElement;
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        let nodes = rootElement.children;

        // Processes each node, verifying errors.
        let parsable_blocks = Object.keys(PARSE_FUNCTION);
        let blocks_missing = Object.keys(XML_SEQUENCE_POSITION);
        for (let i = 0; i < nodes.length; i++) {
            let nodeName = nodes[i].nodeName;

            if (!(parsable_blocks.includes(nodeName))) {
                if ((nodeName in PARSE_FUNCTION)) {
                    this.onXMLMinorError(`More than one <${nodeName}> block was detected, only the first one declared is considered`);
                }
                continue;
            }

            if (nodeName in XML_SEQUENCE_POSITION && (XML_SEQUENCE_POSITION[nodeName] != i)) {
                this.onXMLMinorError(`Block <${nodeName}> out of order`);
            }

            let error;
            if (nodeName in PARSE_FUNCTION && ((error = PARSE_FUNCTION[nodeName](nodes[i], this)) != null)) {
                this.onXMLError(error);
                return;
            }

            blocks_missing = blocks_missing.filter(b => b !== nodeName);
            parsable_blocks = parsable_blocks.filter(b => b !== nodeName);
        }

        if (blocks_missing.length > 0) {
            this.onXMLError(`Blocks missing: ${blocks_missing.toString()}`);
            return;
        }

        if (nodes.length > Object.keys(PARSE_FUNCTION).length) {
            this.onXMLMinorError("Extra blocks on the document were't parsed");
        }

        this.loadedOk = true;
        this.log("Scene graph parsing complete");
        this.rootElement = this.components[this.idRoot];
        if (this.rootElement === undefined) {
            this.onXMLError("Can't find root component");
            return;
        }
        if (this.rootElement.materials.includes('inherit')) {
            this.onXMLError("Root component can't have material inherit.");
            return;
        }

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message + `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣤⣤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡤⠾⠁⠀⠀⠀⠀⠀⠀⢹⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠒⣰⡏⣠⠟⠀⠀⠀⢠⠤⠤⠤⠤⢴⣿⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⢂⢤⣼⣾⣾⣿⠀⠀⠀⠀⢸⠀⠀⠀⠀⠈⣿⡔⢳⡦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⣀⣾⣿⣥⣴⣿⣿⣿⣿⣿⣿⣀⣶⡒⢦⡿⠀⠒⡿⠯⢹⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠽⠆⠀⠀⠀⠀⠰⠤⣽⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠒⠂⠀⠀⠀⠀⠐⠲⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⣼⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⣿⡁⠀⠀⠀⠈⢹⣿⣷⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⡟⠁⠀⢸⡑⡄⠀⠀⠀⢠⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀
        ⠀⢠⣿⣿⣿⣿⣿⣿⠟⠛⠉⠀⠀⠀⢧⠀⠀⠀⡇⠈⢢⡀⣠⠇⠀⣿⣿⣿⡟⢿⠻⢿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀
        ⢀⣼⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⡤⠜⠀⠀⠀⠹⡾⣟⣯⣝⣦⡼⢻⣿⡏⡇⠸⠀⢠⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
        ⢨⣿⣿⣿⣿⣿⡿⡆⠀⠀⠀⣄⠀⢣⠀⠀⠀⠀⠀⠹⣖⠲⠽⠿⣧⢀⡏⢹⠁⠀⠀⢀⣿⣿⣿⣿⣿⡿⣿⠀⠀⠀⠀⠀⠀⠀
        ⢈⣿⣿⣿⣿⣿⠁⢇⠀⠀⠀⠸⡀⠈⢧⠀⠀⠀⠀⠀⢻⢍⣉⡓⣾⠸⡇⢸⠀⠸⡀⡎⢹⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀
        ⠈⣿⣿⣿⣿⣿⠀⠘⡄⠀⠀⠀⡧⠀⠈⠣⣀⠀⠀⠀⠘⡦⠬⢭⣿⠀⢹⠉⠀⡴⠁⡆⠈⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀
        ⠐⣿⣿⣿⣿⡏⠀⠐⠚⠀⠀⢀⠇⠀⠀⠀⠈⠓⢤⣀⠀⢹⣿⣿⣯⡀⢸⢀⡞⠀⠀⡇⠀⢿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⢨⣿⣿⣿⡇⠀⢀⣀⣀⣠⣸⠤⣀⠤⠒⠲⠖⠋⠉⡏⠁⠀⢛⣒⡟⢿⡟⠀⠀⠀⡇⠀⢸⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠹⣿⣿⡠⠚⠉⠠⠔⠋⠀⠀⠀⠀⠀⠀⠀⠀⢀⠇⠀⠀⠤⡾⢀⣾⠀⠀⠀⠀⡇⠀⣸⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠈⢿⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣘⣷⡒⢲⣻⣧⠎⣹⠀⠀⠀⢸⠀⠘⢻⠉⠓⠦⢄⣀⢞⣇⣀⣀⡀⠀⠀
        ⠀⠀⠀⠀⠀⢣⡀⠀⠀⠀⢀⠀⣀⣀⠤⠤⠼⠿⠞⠛⠁⠑⣤⡖⢶⠀⣼⠀⢠⣀⣸⠀⠀⠀⠀⠀⠀⡎⠁⢾⠁⠀⢠⣽⣿⣶
        ⠀⠀⠀⠀⠀⠀⠉⠉⠻⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡧⠼⡄⣿⠀⠘⠛⣿⣶⠤⢄⣀⠀⠀⢳⣤⣀⣀⣀⣼⣿⣿⠿
        ⠀⠀⠀⠀⠀⠀⠀⠀⠢⠈⡛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢯⠈⣷⡿⠀⠀⠀⢻⠀⠀⠀⠀⠈⠑⠚⠷⠤⠋⠙⠿⠈⠛⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠧⠤⠤⠤⠐⠒⠒⠒⠉⠉⠉⠉⠉⠛⢶⠾⠗⠒⠒⠒⠚⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        renderElement(this.rootElement);
    }
}