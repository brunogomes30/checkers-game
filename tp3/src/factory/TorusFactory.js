import { MyTorus } from "../primitives/MyTorus.js";
import { buildValues } from "./utils.js";

/**
 * Torus factory that creates new toruses
 * @export
 * @class TorusFactory
 */
export class TorusFactory {
    constructor() {
        this.attributes = {
            'inner': 'float',
            'outer': 'float',
            'slices': 'integer',
            'loops': 'integer',
        }
    }

    /**
     * Builds a torus based on the given node, reading its attributes
     * @param {XMLReader} reader
     * @param {XMLNode} node
     * @param {Scene} scene
     * @param {string} id
     * @returns {MyTorus} or error string if any of the attributes is missing
     * @memberof TorusFactory
     */
    build(reader, node, scene, id) {
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object'){
            return values;
        }
        return new MyTorus(scene, id, values);
    }
}