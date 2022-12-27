import { PrimitiveFactory } from './factory/PrimitiveFactory.js';
import { renderElement } from './components/renderElement.js';
import { SXSReader } from './parser/SXSReader.js';


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

/**
 * MySceneGraph class, representing the scene graph.
 * @constructor
 * @param {String} filename - Path to the XML file.
 * @param {XMLscene} scene - Reference to MyScene object.
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
        this.helperReaders = [];
        this.reader = new SXSReader(this, filename, true);
        this.factory = new PrimitiveFactory(this.reader);
        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open();
        this.piPrecision = 100;
        this.piInteger = Math.round(Math.PI * this.piPrecision);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");

        // Here should go the calls for different functions to parse the various blocks
        this.parseSceneGraph();
    }

    /**
     * Parses the XML scene file, processing each block and included XML files.
     */
    parseSceneGraph() {
        // TODO: Unite all the parsed files into a single graph
        // Processes each node, verifying errors.

        const blocks_missing = Object.keys(XML_SEQUENCE_POSITION);
        for (const attribute of this.reader.attributes) {
            switch (attribute[0]) {
                case 'idRoot':
                    blocks_missing.splice(blocks_missing.indexOf('scene'), 1);
                    this.idRoot = attribute[1];
                    break;
                case 'referenceLength':
                    this.referenceLength = attribute[1];
                    break;
                case 'cameras':
                    blocks_missing.splice(blocks_missing.indexOf('views'), 1);
                    this.scene.cameras = attribute[1];
                    break;
                case 'defaultCameraId':
                    this.scene.defaultCameraId = attribute[1];
                    break;
                case 'ambient':
                    blocks_missing.splice(blocks_missing.indexOf('ambient'), 1);
                    this.ambient = attribute[1];
                    break;
                case 'background':
                    this.background = attribute[1];
                    break;
                case 'lights':
                    blocks_missing.splice(blocks_missing.indexOf('lights'), 1);
                    this.lights = attribute[1];
                    break;
                case 'enabledLights':
                    this.scene.enabledLights = attribute[1];
                    break;
                case 'textures':
                    blocks_missing.splice(blocks_missing.indexOf('textures'), 1);
                    this.textures = attribute[1];
                    for (let i = 0; i < this.textures.length; i++) {
                        const texture = this.textures[i];
                        this.scene.textures[texture.id] = texture.texture;
                    }
                    break;
                case 'materials':
                    blocks_missing.splice(blocks_missing.indexOf('materials'), 1);
                    this.materials = attribute[1];
                    break;
                case 'transformations':
                    blocks_missing.splice(blocks_missing.indexOf('transformations'), 1);
                    this.transformations = attribute[1];
                    break;
                case 'primitives':
                    blocks_missing.splice(blocks_missing.indexOf('primitives'), 1);
                    this.primitives = attribute[1];
                    break;
                case 'animations':
                    blocks_missing.splice(blocks_missing.indexOf('animations'), 1);
                    this.animations = attribute[1];
                    break;
                case 'models':
                    blocks_missing.splice(blocks_missing.indexOf('models'), 1);
                    this.models = attribute[1];
                    break;
                case 'components':
                    blocks_missing.splice(blocks_missing.indexOf('components'), 1);
                    this.components = attribute[1];
                    break;
                

                default:
                    break;
            }

        }
        if (blocks_missing.length > 0) {
            this.onXMLError(`Blocks missing: ${blocks_missing.toString()}`);
            return;
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

        console.log('Scene graph loaded', this);
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

    /**
     * Updates the highLight shader timeFactor at a given time.
     * 
     * @param {number} timeDeltaMilis Time in miliseconds elapsed since the scene first started.
     */
    updateHighLightShader(timeDeltaMilis) {
        this.scene.highlightShader.setUniformsValues({ timeFactor: ((timeDeltaMilis / 5) % this.piInteger) / this.piPrecision });
    }

    /**
     * Function to update animations with at a given time.
     * 
     * @param {number} timeDelta Time in seconds elapsed since the scene first started.
     */
    computeAnimations(timeDelta) {
        // Iterates over all animations and updates them.
        Object.values(this.animations).forEach(animation => animation.update(timeDelta));
    }

}
