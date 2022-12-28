import { CGFshader, CGFtexture, CGFappearance} from "../../../lib/CGF.js";
import { MyRectangle } from "../primitives/MyRectangle.js";
export class TextRenderer{
    constructor(scene){
        this.scene = scene;
        this.shader = new CGFshader(scene.gl, 'shaders/font.vert', 'shaders/font.frag');
        this.apperance = new CGFappearance(scene);
        this.texture = new CGFtexture(scene, 'scenes/images/text/oolite-font-trans.png');
        this.apperance.setTexture(this.texture);
        this.characterMappping = {};
        //Mapping for lowercase letters
        for(let i = 0; i < 128; i++){
            this.characterMappping[String.fromCharCode(i)] = [i%16, Math.floor(i/16)];
        }
        this.rect = new MyRectangle(scene, 'text', {
            x1: -0.5,
            y1: -0.5,
            x2: 0.5,
            y2: 0.5

        });
    }

    renderText(element, scale = 1.0){
        const scene = this.scene;
        const text = element.text;
        for(let i = 0; i < text.length; i++){
            if(text[i] == ' '){
                continue;
            }
            const charCoords = this.characterMappping[text[i]];
            this.shader.setUniformsValues({charCoords: charCoords});
            scene.pushMatrix();
            scene.scale(scale, scale, scale);
            scene.translate(i/1.75, 0, 0);
            
            this.rect.display();
            scene.popMatrix();
        }
        scene.setActiveShader(scene.defaultShader);
    }

    render(list){
        const scene = this.scene;
        scene.setActiveShader(this.shader, undefined, undefined, false);
        this.apperance.apply();
        this.texture.bind();
        for(let i = 0; i < list.length; i++){
            const value = list[i];
            const text = value.element;
            scene.pushMatrix();
            
            this.renderText(text);
            scene.popMatrix();
        }
    }
    

}