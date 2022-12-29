import { CGFobject } from '../../../lib/CGF.js';
import { XMLscene } from '../XMLscene.js';

export class MyFragment extends CGFobject {
	constructor(scene, id, buffers) {
		super(scene);

		this.id = id;
		this.vertices = buffers.vertices;
        this.indices = buffers.indices;
        this.normals = buffers.normals;
        this.texCoords = buffers.texCoords;
		this.material = buffers.material;
		this.initBuffers();
	}

	/**
	 * Initializes the buffers of the model fragment
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

	clone(){
		const clone = new MyFragment(this.scene, this.id, this);
		for(let key in this){
            clone[key] = this[key];
        }
		clone.material = this.material;
		return clone;
	}
    
}