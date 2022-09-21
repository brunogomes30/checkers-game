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
        console.log(node);
        const values = buildValues(this.attributes, reader, node);
        return new MyRectangle(scene, id, values);
    }
}