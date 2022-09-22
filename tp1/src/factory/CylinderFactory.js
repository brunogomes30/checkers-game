import { MyCylinder } from "../primitives/MyCylinder.js";
import { buildValues } from "./utils.js";

export class CylinderFactory{
    constructor(){
        //sirizio, melhor forma para fazer isto?
        // Podemos arranjar forma de colocar default values caso não sejas dados, mas não parece que possamos permitir isso
        this.attributes = {
            'base': 'float',
            'top': 'float',
            'height': 'float',
            'slices': 'integer',
            'stacks' : 'integer',
        }
    }

    build(reader, node, scene, id){
        const values = buildValues(this.attributes, reader, node);
        return new MyCylinder(scene, id, values);
    }
}