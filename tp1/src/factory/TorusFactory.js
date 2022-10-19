import { MyTorus } from "../primitives/MyTorus.js";
import { buildValues } from "./utils.js";

export class TorusFactory {
    constructor() {
        //sirizio, melhor forma para fazer isto?
        // Podemos arranjar forma de colocar default values caso não sejas dados, mas não parece que possamos permitir isso
        this.attributes = {
            'inner': 'float',
            'outer': 'float',
            'slices': 'integer',
            'loops': 'integer',
        }
    }

    build(reader, node, scene, id) {
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object'){
            return values;
        }
        return new MyTorus(scene, id, values);
    }
}