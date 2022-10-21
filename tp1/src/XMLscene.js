import { Texture } from './textures/Texture.js'
import { CGFappearance, CGFscene, CGFtexture } from '../../lib/CGF.js';
import { CGFaxis, CGFcamera } from '../../lib/CGF.js';
import { buildInterface } from './interface/build.js';
import { MyInterface } from './MyInterface.js';
import { switchLight } from './controllers/lights.js'
import { switchCamera } from './controllers/cameras.js'
import { TextureScaleFactors } from './textures/TextureScaleFactors.js';

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

        this.defautlTexture = new Texture('', this, '/tp1/scenes/default_images/missing-texture.jpg')
        this.defaultTextureCoordinates = new TextureScaleFactors(1, 1)

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
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

    setDefaultAppearance() {
        this.defaultAppearance.apply()
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
    }

    /**
     * Displays the scene.
     */
    display() {
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
        this.axis.display();
        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            for (let i = 0; i < 8; i++) {
                this.lights[i].update();
            }
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

}

function setAttenuation(light, attenuationVec) {
    light.setConstantAttenuation(attenuationVec[0]);
    light.setLinearAttenuation(attenuationVec[1]);
    light.setQuadraticAttenuation(attenuationVec[2])
}