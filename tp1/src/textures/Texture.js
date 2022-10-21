import { CGFtexture } from "../../../lib/CGF.js"

/**
 * MyTexture
 * @constructor
 * @param {String} id - ID of the texture
 * @param {XMLscene} scene - Reference to MyScene object
 * @param {String} file - Path to the texture file
 */
export class Texture{
    constructor(id, scene, textureURL){
        this.id = id;
        this.scene = scene;
        this.texture = new CGFtexture(this.scene, textureURL);
    }
}
