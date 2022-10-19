import { MyRectangle } from "../primitives/MyRectangle.js";
import { buildValues } from "./utils.js";

export class RectangleFactory{
    constructor(){
        //sirizio, melhor forma para fazer isto?
        // Podemos arranjar forma de colocar default values caso não sejas dados, mas não parece que possamos permitir isso
        this.attributes = {
            'x1': 'float',
            'x2': 'float',
            'y1': 'float',
            'y2': 'float'
        }
    }

    build(reader, node, scene, id){
        const values = buildValues(this.attributes, reader, node, id);
        if (values == null || typeof values !== 'object'){
            return values;
        }
        return new MyRectangle(scene, id, values);
    }
}