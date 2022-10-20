import { MyRectangle } from "../primitives/MyRectangle.js";
import { buildValues } from "./utils.js";

/**
 * Rectangle factory that creates new rectangles
 * @export
 * @class RectangleFactory
 */
export class RectangleFactory{
    constructor(){
        this.attributes = {
            'x1': 'float',
            'x2': 'float',
            'y1': 'float',
            'y2': 'float'
        }
    }

    /**
     * Builds a rectangle based on the given node, reading its attributes
     * @param {XMLReader} reader
     * @param {XMLNode} node
     * @param {Scene} scene
     * @param {string} id
     * @returns {MyRectangle} or error string if any of the attributes is missing
     * @memberof RectangleFactory
     
     */
    build(reader, node, scene, id){
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object'){
            return values;
        }
        return new MyRectangle(scene, id, values);
    }
}