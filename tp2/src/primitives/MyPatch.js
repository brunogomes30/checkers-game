import { CGFnurbsObject, CGFnurbsSurface} from '../../../lib/CGF.js';

export class MyPatch extends CGFnurbsObject {
	constructor(scene, id, values)  {
		let nurbsSurface = new CGFnurbsSurface(values.degree_u, values.degree_v, values.control_points);
		super(scene, values.parts_u, values.parts_v, nurbsSurface);
		
		this.id = id;
	}

	/**
     * Dummy function
     */
	 updateTexCoords(length_s, length_t) {
        if (length_s == undefined || length_t == undefined){
			return;
		}
		
		this.texCoords = [
			0, this.yDist/ length_t ,
			this.xDist / length_s,  this.yDist / length_t,
			0, 0,
			this.xDist/ length_s , 0
		]
        
		this.updateTexCoordsGLBuffers();
    }
}

