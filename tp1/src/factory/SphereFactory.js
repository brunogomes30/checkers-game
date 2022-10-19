import { MySphere } from "../primitives/MySphere.js";
import { buildValues } from "./utils.js";

export class SphereFactory{
    constructor(){
        //sirizio, melhor forma para fazer isto?
        // Podemos arranjar forma de colocar default values caso não sejas dados, mas não parece que possamos permitir isso
        this.attributes = {
            'radius': 'float',
            'stacks': 'integer',
            'slices': 'integer'
        }
    }

    build(reader, node, scene, id){
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object'){
            return values;
        }
        return new MySphere(scene, id, values);
    }
}