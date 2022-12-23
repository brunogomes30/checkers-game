import { MyCylinder } from "../primitives/MyCylinder.js";
import { buildValues } from "./utils.js";

/**
 * Cylinder factory that creates new cylinders
 * @export
 * @class CylinderFactory   
 */
export class CylinderFactory{
    constructor(){
        this.attributes = {
            'base': 'float',
            'top': 'float',
            'height': 'float',
            'slices': 'integer',
            'stacks' : 'integer',
        }
    }

    /**
     * Builds a cylinder based on the given node, reading its attributes
     * @param {CylinderOptions} options
     * @returns 
     * @returns {MyCylinder} or error string if any of the attributes is missing
     */
    build(reader, node, scene, id){
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object' ){
            return values;
        }
        return new MyCylinder(scene, id, values);
    }
}