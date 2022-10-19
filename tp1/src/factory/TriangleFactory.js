import { MyTriangle } from "../primitives/MyTriangle.js";
import { buildValues } from "./utils.js";

export class TriangleFactory {
    constructor() {
        //sirizio, melhor forma para fazer isto?
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

    build(reader, node, scene, id) {
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object'){
            return values;
        }
        return new MyTriangle(scene, id, values);
    }
}
