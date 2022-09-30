import { CGFtexture } from "../../../lib/CGF.js"

export class Texture{
    constructor(id, scene, textureURL){
        this.id = id;
        this.scene = scene;
        this.texture = new CGFtexture(this.scene, textureURL);
    }
}
