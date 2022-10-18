import { CGFobject } from '../../../lib/CGF.js';
import { distance, vectorSum, vectorDiff, vectorMult, vectorNormalize } from './geometryUtils.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
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
	
	initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        const radiusIncrease = (this.top - this.base)  / (this.stacks);
        let radius = this.base - radiusIncrease;

        const stackHeight = this.height / this.stacks;
        let sliceAngle = Math.PI * 2 / this.slices;
        let z = -stackHeight;
        
        for(let stack = 0; stack <= this.stacks; stack++){
            z += stackHeight;
            radius += radiusIncrease;
            let angle = -sliceAngle;
            for(let slice = 0; slice < this.slices; slice++){    
                angle += sliceAngle;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                this.vertices.push(x, y, z);

                const textS = slice / this.slices;
                const textT = stack / this.stacks;
                this.texCoords.push(textS, textT);

            }
        }

        const vertCount = this.vertices.length / 3 - this.slices;
        for(let i=0; i < vertCount; i++){
            // p3  p4
            // p1  p2
            const p1 = i;
            const p3 = i + this.slices;
            let p2, p4;
            if((i + 1) % this.slices == 0){
                p2 = i - this.slices + 1;
                p4 = i + 1;
            } else {
                p2 = i + 1;
                p4 = i + this.slices + 1;
            }
            this.indices.push(p1, p2, p4);
            this.indices.push(p4, p3, p1);
        }

        console.log(this);
        
        const xxx = this.slices * (this.stacks - 1) * 3;
        let possibleNormals = [];
        for(let i=0; i < this.slices; i++){
            const offset = i*3;
            const vertI = [this.vertices[offset], this.vertices[offset + 1], this.vertices[offset + 2]];
        
            const vertP = [this.vertices[xxx + offset], this.vertices[xxx + offset + 1], this.vertices[xxx + offset + 2]];
            const orient = vectorNormalize(vectorDiff([0, 0, 0], vertP));
            const normalVector = calculateNormalVector(vertP, vertI, this.base, orient);
            possibleNormals.push(...normalVector);
        }

        for(let i = 0; i <= this.stacks; i+=1){
            this.normals.push(...possibleNormals);
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

    updateTexCoords(lenght_s, lenght_t){
        return;
    }

}

/**
 * https://stackoverflow.com/questions/66343772/cone-normal-vector
 * @param {*} vertP 
 * @param {*} vertI 
 * @param {*} vertA 
 */
function calculateNormalVector(vertP, vertI, radius, orient){
    let dis = distance(...vertI, ...vertP);
    let k = radius / dis;
    let D = dis * Math.sqrt(1 + k**2);
    orient = vectorMult(orient, D);
    let A = vectorSum(vertP, orient);
    return vectorNormalize(vectorDiff(vertI, A));

}
