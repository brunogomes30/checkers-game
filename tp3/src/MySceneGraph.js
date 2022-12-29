import { PrimitiveFactory } from './factory/PrimitiveFactory.js';
import { renderElement } from './components/renderElement.js';
import { SXSReader } from './parser/SXSReader.js';
import { buildInterface } from './interface/build.js';

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
    constructor(filename, scene, name) {
        if (name !== undefined) {
            this.name = name;
        } else {
            this.name = filename;
        }

        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;


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
        this.cameras = {};
        this.lights = [];
        this.enabledLights = []
        this.textures = [];
        this.materials = [];
        this.transformations = [];
        this.primitives = [];
        this.animations = [];
        this.models = [];
        this.components = [];
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
        this.reader.updateGraph();

        this.rootElement = this.components[this.idRoot];
        if (this.rootElement === undefined) {
            this.onXMLError("Can't find root component");
            return;
        }
        if (this.rootElement.materials.includes('inherit')) {
            this.onXMLError("Root component can't have material inherit.");
            return;
        }


        // Replace references in components and add highlited components
        this.highlightedComponents = [];
        for (let component of Object.values(this.components)) {
            // Replace transformation ID's with transformation object
            if (component.transformation.transformationID !== undefined) {
                if (!(component.transformation.transformationID in this.transformations)) {
                    this.onXMLMinorError(`Unable to find transformation with ID '${transformationID}' in component '${errorMsg}'`);
                    component.transformation = mat4.create();
                }
                component.transformation = this.transformations[component.transformation.transformationID];
            }

            // Replace material ID's with material objects
            for (let i = 0; i < component.materials.length; i++) {
                if (component.materials[i] === 'inherit') {
                    continue;
                }

                if (component.materials[i] in this.materials) {
                    component.materials[i] = this.materials[component.materials[i]];
                }
                else {
                    this.onXMLMinorError(`Matrial with ID '${component.materials[i]}' not found, Using default material.`);
                    component.materials[i] = this.scene.defaultAppearance;
                }
            }

            // Replace texture ids with texture objects
            if (component.texture != 'inherit' && component.texture != 'none') {
                //console.log(component.texture, this.textures)
                const textures = this.textures.filter(tex => tex.id == component.texture);
                if (textures.length < 1) {
                    this.onXMLMinorError(`Texture with ID '${component.texture}' not found, Using default texture.`);
                    component.texture = this.scene.defaultTexture;
                } else {
                    component.texture = textures[0];
                }
            }

            // Replace children with primitive/component/model objects
            for (let i = 0; i < component.primitiveChildren.length; i++) {
                const primitive = this.primitives[component.primitiveChildren[i]]
                if (primitive === undefined) {
                    this.onXMLError(`Primitive "${component.primitiveChildren[i]}" not found in component "${component.id}"`);
                    return;
                }

                component.children.push(primitive);
            }

            for (let i = 0; i < component.modelChildren.length; i++) {
                const model = this.models[component.modelChildren[i]];
                if (model instanceof String) {
                    this.onXMLError(`Error parsing model "${component.modelChildren[i]}" in component "${component.id}"`);
                    return;
                }
                component.children.push(model);
            }

            for (let i = 0; i < component.textChildren.length; i++) {
                component.children.push(component.textChildren[i]);
            }

            // Change all component reference strings to the component reference
            for (let i = 0; i < component.componentChildren.length; i++) {
                const childComponent = this.components[component.componentChildren[i]];
                if (childComponent == undefined) {
                    this.onXMLError(`Unable to find referenced component '${component.componentChildren[i]}' in component '${component.id}'`);
                    return;
                }

                component.children.push(childComponent);
            }


            // Replace animation ID's with animation objects
            if (component.animation !== undefined && component.animation !== 'none') {
                if (component.animation in this.animations) {
                    component.animation = this.animations[component.animation];
                } else {
                    this.onXMLMinorError(`Animation with ID '${component.animation}' not found, continuing without animation.`);
                }
            }

            if (component.highlight.hasHighlight)
            this.highlightedComponents[component.id] = true;
        }

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.loadedOk = true;
        this.log("Scene graph parsing complete");

        this.activeCameraId = this.defaultCameraId
        buildInterface(this.scene.interface, this);

        if (this.selected) {
            this.scene.onGraphLoaded()
        }
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
