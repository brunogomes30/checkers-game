import { CGFobject } from '../../../lib/CGF.js';
import { XMLscene } from '../XMLscene.js';

export class MyObject extends CGFobject {
	constructor(scene, id, buffers) {
		super(scene);

		this.id = id;
		this.vertices = buffers.vertices;
        this.indices = buffers.indices;
        this.normals = buffers.normals;
        this.texCoords = buffers.texCoords;
        // print parameters
        console.log("Created object " + id);

		this.initBuffers();
	}
	
	/**
	 * Initializes the buffers of the rectangle
	 * @memberof MyModel
	 * @private
	 */
	initBuffers() {
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * Dummy function
	 * @memberof MyModel
	 * @param {Number} length_s - Amplification factor in the S axis
	 * @param {Number} length_t - Amplification factor in the T axis
	 */
	updateTexCoords(length_s, length_t){
	
    }
}