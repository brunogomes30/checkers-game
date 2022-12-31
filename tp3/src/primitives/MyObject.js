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


	/**
	 * Sets pickable
	 * @memberof MyModel
	 * @param {Boolean} pickable - If the model is pickable
	 * @param {Function} conditionFunction - Function that returns true if the model should be pickable. Accepts the fragment id as a parameter
	 */
	setPickable(pickable, conditionFunction){
		if(pickable && conditionFunction(this.id)){
			this.pickable = true;
		}
	}

	setClass(className, conditionFunction){
		if(conditionFunction(this.id)){
			this.className = className;
		}
	}

	changeMaterial(material){
		for(let i=0; i<this.fragments.length; i++){
			this.fragments[i].changeMaterial(material);
		}
	}

	resetMaterial(){
		for(let i=0; i<this.fragments.length; i++){
			this.fragments[i].resetMaterial();
		}
	}

	genericSet(attributeName, value, conditionFunction){
		if(conditionFunction(this.id)){
			this[attributeName] = value;
		}
	}



	display(){
		if(this.pickable){
			this.scene.registerForPick(this);
		}
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

	clone(){
		const object = new MyObject(this.scene, this.id, {
			fragments: this.fragments
		});
        for(let key in this){
			if(key === 'scene'){
				continue;
			}
            object[key] = this[key];
        }
		for(let i=0; i<this.fragments.length; i++){
			object.fragments[i] = this.fragments[i].clone();
		}
		return object;
	}
}