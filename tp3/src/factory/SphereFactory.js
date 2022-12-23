import { MySphere } from "../primitives/MySphere.js";
import { buildValues } from "./utils.js";

/**
 * Sphere factory that creates new spheres
 * @export
 * @class SphereFactory
 */
export class SphereFactory{
    constructor(){
        this.attributes = {
            'radius': 'float',
            'stacks': 'integer',
            'slices': 'integer'
        }
    }

    /**
     * Builds a sphere based on the given node, reading its attributes
     * @param {XMLReader} reader
     * @param {XMLNode} node
     * @param {Scene} scene
     * @param {string} id
     * @returns {MySphere} or error string if any of the attributes is missing
     * @memberof SphereFactory
     */
    build(reader, node, scene, id){
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object'){
            return values;
        }
        return new MySphere(scene, id, values);
    }
}