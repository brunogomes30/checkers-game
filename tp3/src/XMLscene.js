import { Texture } from './textures/Texture.js'
import { CGFappearance, CGFscene, CGFtexture, CGFshader, CGFobject, CGFlight } from '../../lib/CGF.js';
import { CGFaxis, CGFcamera } from '../../lib/CGF.js';
import { buildInterface } from './interface/build.js';
import { MyInterface } from './MyInterface.js';
import { switchLight } from './controllers/lights.js'
import { switchCamera } from './controllers/cameras.js'
import { TextureScaleFactors } from './textures/TextureScaleFactors.js';
import { ToonShader } from './toonShade/toonShader.js';
import { TextRenderer } from './text/TextRenderer.js';
import { BoardController } from './checkers/controller/BoardController.js';


let FRAME_RATE = 60;
/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;
        this.setLightsVisible = false;
        this.displayNormals = false;
        this.displayAxis = true;

        this.initCameras();

        this.enableTextures(true);


        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.defaultAppearance = new CGFappearance(this);
        this.defaultAppearance.setShininess(10.0);
        this.defaultAppearance.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.defaultAppearance.setEmission(0.2, 0.3, 0.7, 1.0);
        this.defaultAppearance.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.defaultAppearance.setAmbient(0.4, 0.4, 0.8, 1.0);

        this.defaultTexture = new Texture('', this, '/tp2/scenes/default_images/missing-texture.jpg');
        this.defaultTextureScaling = new TextureScaleFactors(1, 1);
        this.highlightShader = new CGFshader(this.gl, "shaders/highlight.vert", "shaders/highlight.frag");

        this.defaultShader = new CGFshader(this.gl, "shaders/outlineVert.glsl", "shaders/outlineFrag.glsl");
        this.toonShader = new ToonShader(this);
        this.textRenderer = new TextRenderer(this);

        this.axis = new CGFaxis(this);
        this.isLooping = false;
        this.setUpdatePeriod(1000 / FRAME_RATE);
        this.startTime = null;
        this.textures = {};
        this.highlightedComponents = [];
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0))
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        let lightsIndex = 0;

        // Update webCGF lights with graph lights
        for (let key in this.graph.lights) {
            if (lightsIndex >= 8) {
                break;              // Only eight lights allowed by WebGL.
            }
            const sceneLight = this.lights[lightsIndex];
            const light = this.graph.lights[key];

            sceneLight.setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
            sceneLight.setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
            sceneLight.setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
            sceneLight.setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

            setAttenuation(sceneLight, light[6])

            if (light[1] == "spot") {
                sceneLight.setSpotCutOff(light[7]);
                sceneLight.setSpotExponent(light[8]);
                sceneLight.setSpotDirection(light[9][0] - light[2][0], light[9][1] - light[2][1], light[9][2] - light[2][2]);
            }

            // Set light states
            switchLight(this, key, lightsIndex)

            lightsIndex++;
        }
    }

    /**
     * Sets the default appearance.
     */
    setDefaultAppearance() {
        this.defaultAppearance.apply()
    }

    /**
     * Gets the default appearance.
     */
    getDefaultApperance() {
        return this.defaultAppearance;
    }

    /**
     * Gets the highlight shader.
     */
    getHighlightShader() {
        return this.highlightShader;
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.sceneInited = true;


        this.interface.activeCameraId = this.defaultCameraId
        switchCamera(this.interface, this, this.defaultCameraId)

        buildInterface(this.interface, this);

        this.materialIndex = 0;
        this.boardController = new BoardController(this, 8);
        this.boardController.init();
    }

    /**
     * Updates the time passed since the start of the scene.
     * Used in animations and shaders.
     * 
     * @param {Number} currTime Current time in milliseconds.
     */
    update(currTime) {
        if (this.sceneInited) {
            if (this.startTime === null)
                this.startTime = currTime;

            let timeDelta = currTime - this.startTime;
            this.graph.computeAnimations(timeDelta / 1000)
            this.graph.updateHighLightShader(timeDelta);
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        //this.setDefaultShader();
        this.shaderMap = new Map();
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();
            
            // Displays the scene (MySceneGraph function).
            
            this.graph.displayScene();
            for (const [key, list] of Object.entries(this.shaderMap)) {
                const shader = JSON.parse(key);
                if (shader.fragmentURL === this.defaultShader.fragmentURL) {
                    this.toonShader.render(list);
                    continue;
                } else if(shader.fragmentURL === this.textRenderer.shader.fragmentURL) {
                    this.textRenderer.render(list);
                    continue;
                }
                this.setActiveShader(shader, {}, undefined);
                for (const value of list) {
                    this.pushMatrix();
                    this.loadIdentity();
                    this.multMatrix(value.matrix);
                    if (value.texture == null) {
                        value.apperance.setTexture(null);
                    }
                    else {
                        value.apperance.setTexture(value.texture.texture);
                        const textureScalling = value.textureScalling;
                        value.element.updateTexCoords(textureScalling.length_s, textureScalling.length_t);
                    }
                    this.setValuesToShader(value.shader.shader, value.shader.values, value.shader.texture);
                    value.apperance.apply();
                    value.element.display();
                    this.popMatrix();
                }
            }

        }
        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    /**
     * Sets the active shader.
     * 
     * @param {CGFshader} shader Shader to be used.
     * @param {Object} values Values to be passed to the shader.
     * @param {CGFtexture} texture Texture to be passed to the shader.
     */
    setActiveShader(shader, values, texture, findShader = true) {
        const current_shader = this.setValuesToShader(shader, values, texture, findShader);
        super.setActiveShader(current_shader);
    }

    setValuesToShader(shader, values, texture, findShader) {
        const valuesToShader = {};
        if (values === undefined){
            values = {};
        }
        for (const [key, value] of Object.entries(values)) {
            switch (value.type) {
                case 'texture':
                    valuesToShader[key] = this.textures[texture];
                    break;
                case 'literal':
                    valuesToShader[key] = value.value;
                    break;
                case 'webglTexture':
                    this.gl.activeTexture(this.gl.TEXTURE0 + value.bind);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, value.value);
                    valuesToShader[key] = value.bind;
                    break;
            }
        }
        let current_shader = shader;
        if(findShader){
            current_shader = this.defaultShader;
            switch(shader.fragmentURL) {
                // This should be changed
                case 'shaders/highlight.frag':
                    current_shader = this.highlightShader;
                    break;
                case 'shaders/outlineFrag.glsl':
                    current_shader = this.defaultShader;
                    break;
                
            }
        }
        valuesToShader['canvasWidth'] = this.gl.canvas.width;
        valuesToShader['canvasHeight'] = this.gl.canvas.height;
        if (Object.keys(values).length > 0) {
            current_shader.setUniformsValues(valuesToShader);
        }
        if (texture != undefined) {
            texture.bind();
        }
        return current_shader;
    }

    /**
     * Register element to be displayed with the respective shader.
     * @param {CGFobject} element Element to be displayed.
     */
    addElementToDisplay(element) {
        const key = JSON.stringify(element.shader.shader);
        if (this.shaderMap[key] == undefined) {
            this.shaderMap[key] = [];
        }
        this.shaderMap[key].push(element);
    }

    /**
     * Sets the higlighted shader with the respective options.
     * 
     * @param {Number} r Red component of the highlight color
     * @param {Number} g Green component of the highlight color
     * @param {Number} b Blue component of the highlight color
     * @param {Number} scale_h Scale factor for the highlight
     * @param {CGFtexture} texture Texture to be applied to the highlighted object
     */
    setHighlightShader(red, green, blue, scale_h, texture) {
        this.highlightShader.setUniformsValues({
            redValue: red,
            greenValue: green,
            blueValue: blue,
            scaleH: scale_h,
        });

        this.setActiveShader(this.highlightShader);
        if (texture != null) {
            texture.bind();
        }

    }

    /**
     * Sets the default shader.
     */
    setDefaultShader() {
        super.setActiveShader(this.defaultShader);
    }
}

/**
 * Sets light attenuation for a given light.
 * 
 * @param {CGFlight} light  The light to set the attenuation for.
 * @param {Array} attenuationVec Array with 3 values. One for each attenuation factor (constant, linear and quadratic).
 */
function setAttenuation(light, attenuationVec) {
    light.setConstantAttenuation(attenuationVec[0]);
    light.setLinearAttenuation(attenuationVec[1]);
    light.setQuadraticAttenuation(attenuationVec[2])
}
