export class ShaderPass{
    constructor(scene, shader, renderToTexture, passDependencies, attributes){
        this.gl = scene.gl;
        this.scene = scene;
        this.shader = shader;
        this.passDependencies = passDependencies;
        this.renderToTexture = renderToTexture;
        this.attributes = attributes;
        this.preparePass();
    }

    preparePass() {
        if(!this.renderToTexture){
            this.targetTexture = null;
            return;
        }
        const gl = this.gl;
        const scene = this.scene;
        this.targetTexture = gl.createTexture();
        const [width, height] = [gl.canvas.width, gl.canvas.height];

        gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

        // attach texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.targetTexture, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("Framebuffer not complete");
        }

        // create a depth renderbuffer
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

        // make a depth buffer and the same size as the targetTexture
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    render(list){
        const scene = this.scene;
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

        const shaderValues = {};
        for (const dependency of this.passDependencies) {
            shaderValues[dependency.textureName] = {
                type: 'webglTexture',
                bind: dependency.bind,
                value: dependency.pass.targetTexture,
            };
        }
        if(this.targetTexture){
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
        }
        
        scene.setActiveShader(this.shader, shaderValues, undefined, false);
        scene.pushMatrix();
        if(this.attributes.useLighting){
            for (let i = 0; i < 8; i++) {
                scene.lights[i].update();
            }
        }

        if (this.attributes.displayAxis && scene.displayAxis) {
            scene.setDefaultAppearance();
            scene.axis.display();
        }
        for (const value of list) {
            scene.pushMatrix();
            scene.loadIdentity();
            scene.multMatrix(value.matrix);
            if(this.attributes.applyApperance){
                if (value.texture == null) {
                    value.apperance.setTexture(null);
                }
                else {
                    console.log('texture ' + value)
                    value.apperance.setTexture(value.texture.texture);
                    const textureScalling = value.textureScalling;
                    value.element.updateTexCoords(textureScalling.length_s, textureScalling.length_t);
                }
                scene.setValuesToShader(value.shader.shader, value.shader.values, value.shader.texture);
                value.apperance.apply();
            }
            value.element.display();
            scene.popMatrix();
        }
        scene.popMatrix();
        
    }
}