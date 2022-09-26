import { RectangleFactory } from "./RectangleFactory.js"
import { TriangleFactory } from "./TriangleFactory.js"
import { CylinderFactory } from "./CylinderFactory.js"
import { TorusFactory } from "./TorusFactory.js";
import {SphereFactory} from "./SphereFactory.js"


export class PrimitiveFactory {

    constructor(reader) {
        this.reader = reader;
        this.PRIMITIVE_CONSTRUCTORS = {
            rectangle: new RectangleFactory(),
            triangle: new TriangleFactory(),
            cylinder: new CylinderFactory(),
            torus: new TorusFactory(),
            sphere: new SphereFactory()

        };
    }

    build(node, reader, scene) {
        const id = reader.getString(node, 'id');
        const grandChildren = node.children;

        if (grandChildren.length !== 1) {
            console.warn(`Warning: primitive can only have one child`);
        }

        //Melhorar nomes das variaveis ig
        const grandChild = grandChildren[0];
        const type = grandChild.nodeName;
        if (!type in this.PRIMITIVE_CONSTRUCTORS) {
            console.warn(`Warning: Unkown primitive ${type}`);
        }
        const factory = this.PRIMITIVE_CONSTRUCTORS[type];
        return factory.build(reader, grandChild, scene, id);
    }
}