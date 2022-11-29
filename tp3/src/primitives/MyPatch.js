import { CGFnurbsObject, CGFnurbsSurface} from '../../../lib/CGF.js';

/**
 * MyPatch
 * 
 * @constructor
 * @param {CGFscene} scene Reference to MyScene object
 * @param {string} id Name of the patch object
 * @param {Object} values Values of the patch (degree_u, degree_v, parts_u, parts_v, control_points)
 * 
 * @extends CGFnurbsObject
 */ 
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
        return;
    }
}

