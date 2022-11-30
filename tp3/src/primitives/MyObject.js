import { CGFobject } from '../../../lib/CGF.js';
import { XMLscene } from '../XMLscene.js';

export class MyObject{
	constructor(scene, id, buffers) {
		this.scene = scene;
		this.id = id;
		this.fragments = buffers.fragments;
		this.initBuffers();
	}
	
	/**
	 * Initializes the buffers of the rectangle
	 * @memberof MyModel
	 * @private
	 */
	initBuffers() {
		for(let i=0; i<this.fragments.length; i++){
			this.fragments[i].initBuffers();
		}
	}

	display(){
		for(let i=0; i<this.fragments.length; i++){
			const material = this.fragments[i].material;
			if(material != undefined) {
				material.apply();
			}
			this.fragments[i].display();
		}
	}

	/**
	 * Dummy function
	 * @memberof MyModel
	 * @param {Number} length_s - Amplification factor in the S axis
	 * @param {Number} length_t - Amplification factor in the T axis
	 */
	updateTexCoords(length_s, length_t){
	
    }

	updateTexCoords(length_s, length_t) {
        for(let i=0; i<this.fragments.length; i++){
			this.fragments[i].updateTexCoords(length_s, length_t);
		}
    }

    enableNormalViz() {
        for(let i=0; i<this.fragments.length; i++){
			this.fragments[i].enableNormalViz();
		}
    }

    disableNormalViz() {
        for(let i=0; i<this.fragments.length; i++){
			this.fragments[i].disableNormalViz();
		}
    }
}