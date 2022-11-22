import { MyPatch } from "../primitives/MyPatch.js";
import { buildValues } from "./utils.js";

/**
 * Rectangle factory that creates new rectangles
 * @export
 * @class RectangleFactory
 */
export class PatchFactory {
    // <patch degree_u=”ii” parts_u=”ii” degree_v=”ii” parts_v=”ii” >
    constructor() {
        this.attributes = {
            'degree_u': 'integer',
            'parts_u': 'integer',
            'degree_v': 'integer',
            'parts_v': 'integer'
        }
    }

    buildControlPoints(reader, node, id, degree_u, degree_v) {
        const controlPoints = [];
        const children = node.children;

        if (children.length < (degree_u + 1) * (degree_v + 1)){
            return `Not enough control points for patch with ID=${id} with degree_u=${degree_u} and degree_v=${degree_v}`;
        }

        for(let u = 0; u < degree_u + 1; u++){
            let controlPointsU = [];
            for(let v = 0; v < degree_v + 1; v++){
                let index = v + u * (degree_v + 1);

                const x = reader.getFloat(children[index], 'x');
                const y = reader.getFloat(children[index], 'y');
                const z = reader.getFloat(children[index], 'z');
                controlPointsU.push([x, y, z, 1]);
            }
            controlPoints.push(controlPointsU);
        }

        return controlPoints;
    }

    /**
     * Builds a rectangle based on the given node, reading its attributes
     * @param {XMLReader} reader
     * @param {XMLNode} node
     * @param {Scene} scene
     * @param {string} id
     * @returns {MyPatch} or error string if any of the attributes is missing
     * @memberof PatchFactory
     
     */
    build(reader, node, scene, id) {
        const values = buildValues(this.attributes, reader, node, id);
        // Check if values are correctly parsed
        if (values == null || typeof values !== 'object') {
            return values;
        }

        let control_points = this.buildControlPoints(reader, node, id, values.degree_u, values.degree_v)
        if (!Array.isArray(control_points)){
            return control_points
        }
        values['control_points'] = control_points

        return new MyPatch(scene, id, values);
    }
}