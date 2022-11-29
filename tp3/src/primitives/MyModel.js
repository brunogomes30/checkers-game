import { CGFobject } from '../../../lib/CGF.js';
import { XMLscene } from '../XMLscene.js';

export class MyModel extends CGFobject {
	constructor(scene, vertices, texCoords, normals, indices) {
		super(scene);
		this.vertices =vertices;
        this.indices = indices;
        this.normals = normals;
        this.texCoords = texCoords;
        // print parameters
        console.log("vertices: " ,this.vertices);
        console.log("indices: " , this.indices);
        console.log("normals: " , this.normals);
        console.log("texCoords: " , this.texCoords);

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