import { CGFobject } from '../../../lib/CGF.js';
import { truncateDecimalPlaces } from '../factory/utils.js';
import { degToRad, RADIANS_CIRCLE, vectorNormalize } from './geometryUtils.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyTorus extends CGFobject {
    constructor(scene, id, values) {
        super(scene);
        this.id = id;
        this.outter = values.outter;
        this.inner = values.inner;
        this.slices = values.slices;
        this.loops = values.loops;


        this.initBuffers();
    }

    nextVertexInSlice(vertexId, pointPerSlice) {
        const testId = vertexId + 1;
        return testId % pointPerSlice == 0 ? testId - pointPerSlice : testId;
    }

    analogousVertexInNextLoop(vertexId, pointPerSlice, vertexNr) {
        return (vertexId + pointPerSlice) % (vertexNr);
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];
        const loopsStep = RADIANS_CIRCLE / this.loops;
        const slicesStep = RADIANS_CIRCLE / this.slices;
        const texLoopsStep = 1 / this.loops;
        const texSlicesStep = 1 / this.slices;
        const vertexNr = this.loops * this.slices;
        for (let loop = 0; loop < this.loops; loop++) {
            const loopAngle = truncateDecimalPlaces(loop * loopsStep, 10);
            const loopCos = Math.cos(loopAngle);
            const loopSin = Math.sin(loopAngle);
            const translationVec = { x: loopCos * this.outter, y: loopSin * this.outter };

            for (let slice = 0; slice < this.slices; slice++) {
                const sliceAngle = truncateDecimalPlaces(slice * slicesStep, 10);
                const x0 = (Math.sin(sliceAngle) * this.inner)
                const x = x0 * loopCos;
                const y = x0 * loopSin;
                const z = Math.cos(sliceAngle) * this.inner;
                this.vertices.push(x + translationVec.x, y + translationVec.y, z);
                this.normals.push(x, y, z);

                //0  3
                //1  2    
                const vertex0 = slice + loop * this.slices;
                const vertex1 = this.nextVertexInSlice(vertex0, this.slices);
                const vertex2 = this.analogousVertexInNextLoop(vertex1, this.slices, vertexNr);
                const vertex3 = this.analogousVertexInNextLoop(vertex0, this.slices, vertexNr);
                this.indices.push(vertex0, vertex1, vertex2);
                this.indices.push(vertex2, vertex3, vertex0);

                this.texCoords.push(loop * texLoopsStep, slice * texSlicesStep);
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

