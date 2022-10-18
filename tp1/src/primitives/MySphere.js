import { CGFobject } from '../../../lib/CGF.js';
import { vectorNormalize } from './geometryUtils.js';
/**
 * MyRectangle
 * Implementation inspired on http://www.songho.ca/opengl/gl_sphere.html
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MySphere extends CGFobject {
    constructor(scene, id, values) {
        super(scene);
        this.id = id;
        this.radius = values.radius;
        this.stacks = values.stacks;
        this.slices = values.slices;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const stackAngleIncrease = Math.PI / (this.stacks - 1);
        let stackAngle = -Math.PI / 2.0 - stackAngleIncrease;

        const sliceAngleIncrease = 2 * Math.PI / this.slices;


        for (let stack = 0; stack <= this.stacks; stack++) {
            const z = Math.sin(stackAngle) * this.radius;
            const yz = Math.cos(stackAngle) * this.radius;
            stackAngle += stackAngleIncrease;
            let sliceAngle = - sliceAngleIncrease;
            for (let slice = 0; slice <= this.slices; slice++) {
                sliceAngle += sliceAngleIncrease;
                const y = yz * Math.sin(sliceAngle);
                const x = yz * Math.cos(sliceAngle);
                this.vertices.push(x, y, z);
                this.normals.push(...vectorNormalize([x, y, z]));

                const textS = slice > this.slices
                    ? (this.slices - slice * 2) / this.slices
                    : slice * 2 / this.slices;
                const textT = stack / this.stacks;
                this.texCoords.push(textS, textT);
            }


        }

        for (let i = 0; i < this.stacks; i++) {
            let p1 = i * (this.slices + 1);
            let p2 = p1 + this.slices + 1;
            for (let j = 0; j < this.slices; j++) {
                if (i != 0) {
                    this.indices.push(p1 + 1, p2, p1);
                }

                if (i != (this.stacks - 1)) {
                    this.indices.push(p2 + 1, p2, p1 + 1);
                }
                p1++; p2++;


            }
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

    updateTexCoords(length_s, length_t){
        return;
    }
}

