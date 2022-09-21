import {RectangleFactory} from "./RectangleFactory.js"
import {TriangleFactory} from "./TriangleFactory.js"

export class PrimitiveFactory{
    
    constructor(reader){
        this.reader = reader;
        this.PRIMITIVE_CONSTRUCTORS = {
            rectangle: new RectangleFactory(),
            triangle: new TriangleFactory()
        };
    }

    build(node, reader, scene){
        const id = reader.getString(node, 'id');
        const grandChildren = node.children;
        
        if(grandChildren.length !== 1){
            //print warning
        }

        //Melhorar nomes das variaveis ig
        const grandChild = grandChildren[0];
        const type = grandChild.nodeName;
        if(!type in this.PRIMITIVE_CONSTRUCTORS){
            //Print warning
        }
        
        const factory = this.PRIMITIVE_CONSTRUCTORS[type];
        return factory.build(reader, grandChild, scene, id);
    }
}