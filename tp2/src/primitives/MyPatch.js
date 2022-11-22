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
        return;
    }
}

