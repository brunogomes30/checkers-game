import { CGFXMLreader } from '../../lib/CGF.js';
import {parseScene} from './parser/scene.js';
import {parseView} from './parser/view.js';
import {parseAmbient} from './parser/ambient.js';
import {parseLights} from './parser/lights.js';
import {parseTextures} from './parser/textures.js';
import {parseMaterials} from './parser/materials.js';
import {parseTransformations} from './parser/transformations.js';
import {parsePrimitives} from './parser/primitives.js';
import {parseComponents} from './parser/components.js';

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

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
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;
        let error;

        // Processes each node, verifying errors.

        // <scene>
        error = this.genericParse(nodes, 'scene', SCENE_INDEX, parseScene);
        if(error != null){
            return error;
        }

        // <views>
        error = this.genericParse(nodes, 'views', VIEWS_INDEX, parseView);
        if(error != null){
            return error;
        }

        // <ambient>
        error = this.genericParse(nodes, 'ambient', AMBIENT_INDEX, parseAmbient);
        if(error != null){
            return error;
        }

        // <lights>
        error = this.genericParse(nodes, 'lights', LIGHTS_INDEX, parseLights);
        if(error != null){
            return error;
        }

        // <textures>
        error = this.genericParse(nodes, 'textures', TEXTURES_INDEX, parseTextures);
        if(error != null){
            return error;
        }

        // <materials>
        error = this.genericParse(nodes, 'materials', MATERIALS_INDEX, parseMaterials);
        if(error != null){
            return error;
        }

        // <transformations>
        error = this.genericParse(nodes, 'transformations', TRANSFORMATIONS_INDEX, parseTransformations);
        if(error != null){
            return error;
        }

        // <primitives>
        error = this.genericParse(nodes, 'primitives', PRIMITIVES_INDEX, parsePrimitives);
        if(error != null){
            return error;
        }

        // <components>
        error = this.genericParse(nodes, 'components', COMPONENTS_INDEX, parseComponents);
        if(error != null){
            return error;
        }

        this.log("all parsed");
    }    

    genericParse(nodes, tagname, tagIndex, parserFunction){
        let index = -1;

        //Search nodes for desired tag
        for(let i=0; i<nodes.length; i++){
            if(nodes[i].nodeName === tagname){
                index = i;
                break;
            }
        }
        
        if (index == -1)
            return `tag <${tagname}> missing`;
        else {
            if (index != tagIndex)
                this.onXMLMinorError(`tag <${tagname}> out of order`);

            //Parse components block
            let error;
            if (error = parserFunction(nodes[index], this) != null)
                return error;
        }
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
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
        //To do: Create display loop for transversing the scene graph

        //To test the parsing/creation of the primitives, call the display function directly
        this.primitives['demoRectangle'].display();
    }
}