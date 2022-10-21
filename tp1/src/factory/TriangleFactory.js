import { MyTriangle } from "../primitives/MyTriangle.js";
import { buildValues } from "./utils.js";

/**
 * Triangle factory that creates new triangles
 * @export
 * @class TriangleFactory
 */
export class TriangleFactory {
    constructor() {
        this.attributes = {
            'x1': 'float',
            'y1': 'float',
            'z1': 'float',
            'x2': 'float',
            'y2': 'float',
            'z2': 'float',
            'x3': 'float',
            'y3': 'float',
            'z3': 'float'
        }
    }

    /**
     * Builds a triangle based on the given node, reading its attributes
     * @param {XMLReader} reader
     * @param {XMLNode} node
     * @param {Scene} scene
     * @param {string} id
     * @returns {MyTriangle} or error string if any of the attributes is missing
     * @memberof TriangleFactory
     */
    build(reader, node, scene, id) {
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object') {
            return values;
        }
        return new MyTriangle(scene, id, values);
    }
}
