import { CGFobject } from '../../../lib/CGF.js';
import { truncateDecimalPlaces } from '../factory/utils.js';
import { RADIANS_CIRCLE } from './geometryUtils.js';

/**
 * MyTorus
 * @constructor
 * @param {XMLscene} scene - Reference to MyScene object
 * @param {String} id - ID of the rectangle
 * @param {Object} values - Values of the Torus
 * @param {Number} values.inner - Inner radius of the Torus
 * @param {Number} values.outer - Outer radius of the Torus
 * @param {Number} values.slices - Slices of the Torus
 * @param {Number} values.loops - Loops of the Torus
 */
export class MyTorus extends CGFobject {
    constructor(scene, id, values) {
        super(scene);
        this.id = id;
        this.outer = values.outer;
        this.inner = values.inner;
        this.slices = values.slices;
        this.loops = values.loops;


        this.initBuffers();
    }

    /**
     * Initializes the torus buffers
     * @memberof MyTorus
     */
    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];
        const loopsStep = RADIANS_CIRCLE / this.loops;
        const slicesStep = RADIANS_CIRCLE / this.slices;
        const texLoopsStep = 1 / this.loops;
        const texSlicesStep = 1 / this.slices;
        for (let loop = 0; loop <= this.loops; loop++) {
            const loopAngle = truncateDecimalPlaces(loop * loopsStep, 10);
            const loopCos = Math.cos(loopAngle);
            const loopSin = Math.sin(loopAngle);
            const translationVec = { x: loopCos * this.outer, y: loopSin * this.outer };

            for (let slice = 0; slice <= this.slices; slice++) {
                const sliceAngle = truncateDecimalPlaces(slice * slicesStep, 10);
                const x0 = (Math.sin(sliceAngle) * this.inner)
                const x = x0 * loopCos;
                const y = x0 * loopSin;
                const z = Math.cos(sliceAngle) * this.inner;
                this.vertices.push(x + translationVec.x, y + translationVec.y, z);
                this.normals.push(x, y, z);

                this.texCoords.push(-loop * texLoopsStep, -slice * texSlicesStep);
            }
        }

        for (let loop = 0; loop < this.loops; loop++) {
            for (let slice = 0; slice < this.slices; slice++) {
                //0  3
                //1  2    
                const vertex0 = slice + loop * (this.slices + 1);
                const vertex1 = vertex0 + 1
                const vertex2 = vertex1 + this.slices + 1
                const vertex3 = vertex0 + this.slices + 1
                this.indices.push(vertex0, vertex1, vertex2);
                this.indices.push(vertex2, vertex3, vertex0);
            }
        }


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

