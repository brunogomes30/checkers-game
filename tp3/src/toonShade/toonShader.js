import {CGFshader} from '../../../lib/CGF.js';
import {ShaderPass} from './shaderPass.js';
export class ToonShader {

    constructor(scene) {
        this.scene = scene;
        this.gl = scene.gl;
        const gl = this.gl;
        const defaultAttributes = {
            'useLighting': false,
            'applyApperance': true,
            'displayAxis': false,
        }

        const depthAttributes = {...defaultAttributes};
        depthAttributes.applyApperance = false;
        const toonAttributes = {...defaultAttributes};
        toonAttributes.useLighting = true;
        toonAttributes.applyApperance = true;
        toonAttributes.displayAxis = true;

        const outlineAttributes = {...defaultAttributes};
        outlineAttributes.applyApperance = false;

        const depthShader = new CGFshader(gl, "shaders/depthVert.glsl", "shaders/depthFrag.glsl");
        const toonShader = new CGFshader(gl, "shaders/toon.glsl", "shaders/toonFrag.glsl");
        const outlineShader = new CGFshader(gl, "shaders/outlineVert.glsl", "shaders/outlineFrag.glsl");

        const depthPass = new ShaderPass(scene, depthShader, true, [], depthAttributes);
        const toonShadePass = new ShaderPass(scene, toonShader, true, [], toonAttributes);

        //Outline pass is dependent of depthPass and toonShadePass generated textures
        const outlinePass = new ShaderPass(scene, outlineShader, false, 
            [
                {
                    'pass': depthPass,
                    'bind': 1,
                    'textureName': 'depthTexture'
                },
                {
                    'pass': toonShadePass,
                    'bind': 2,
                    'textureName': 'colorTexture'
                }
            ]
        , outlineAttributes);

        this.shaderPasses = [
            depthPass,
            toonShadePass,
            outlinePass
        ];

    }

    render(list) {
        for (const pass of this.shaderPasses) {
            pass.render(list);
        }
    }
}
