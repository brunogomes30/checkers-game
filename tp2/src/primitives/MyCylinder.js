import { CGFobject } from '../../../lib/CGF.js';
import { vectorNormalize } from './geometryUtils.js';
import { XMLscene } from '../XMLscene.js';


/**
 * MyCylinder
 * @constructor
 * @param {XMLscene} scene - Reference to MyScene object
 * @param {String} id - ID of the rectangle
 * @param {Object} values - Values of the Cylinder
 * @param {number} values.base - Base radius of the Cylinder
 * @param {number} values.top - Top radius of the Cylinder
 * @param {number} values.height - Height of the Cylinder
 * @param {number} values.slices - Slices of the Cylinder
 * @param {number} values.stacks - Stacks of the Cylinder
 */
export class MyCylinder extends CGFobject {
    constructor(scene, id, values) {
        super(scene);
        this.id = id;
        this.base = values.base;
        this.top = values.top;
        this.height = values.height;
        this.slices = values.slices;
        this.stacks = values.stacks;


        this.initBuffers();
    }

    /**
     * Initializes the buffers of the cylinder
     * @memberof MyCylinder
     * @private
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        const radiusIncrease = (this.top - this.base) / (this.stacks);
        let radius = this.base - radiusIncrease;

        const stackHeight = this.height / this.stacks;
        let sliceAngle = Math.PI * 2 / this.slices;
        let z = -stackHeight;
        const normalZ = (this.base - this.top) / this.height;
        for (let stack = 0; stack <= this.stacks; stack++) {
            z += stackHeight;
            radius += radiusIncrease;
            let angle = -sliceAngle;
            const textT = stack / this.stacks;
            for (let slice = 0; slice <= this.slices; slice++) {
                angle += sliceAngle;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                this.vertices.push(x, y, z);
                this.normals.push(...vectorNormalize([Math.cos(angle), Math.sin(angle), normalZ]));

                const textS = slice / this.slices;

                this.texCoords.push(1 - textS, textT);

            }
        }

        const vertCount = this.vertices.length / 3 - this.slices - 1;
        for (let i = 0; i < vertCount; i++) {
            // p3  p4
            // p1  p2
            const p1 = i;
            const p3 = i + this.slices;
            let p2, p4;
            p2 = i + 1;
            p4 = i + this.slices + 1;
            this.indices.push(p1, p2, p4);
            this.indices.push(p4, p3, p1);
        }



        /*
        Texture coords (s,t)
        +----------> s
        |
        |
        |
        v
        t
        */

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Dummy function
     */
    updateTexCoords(length_s, length_t) {
        return;
    }

}
