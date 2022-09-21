import { CGFobject } from '../../../lib/CGF.js';
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
        const radiusIncrease = (this.top - this.base) /this.height / this.stacks;
        let radius = this.base - radiusIncrease;

        const stackHeight = this.height / this.stacks;
        let sliceAngle = Math.PI * 2 / this.slices;
        let z = -stackHeight;
        
        for(let stack = 0; stack < this.stacks; stack++){
            z += stackHeight;
            radius += radiusIncrease;
            let angle = -sliceAngle;
            for(let slice = 0; slice < this.slices; slice++){    
                angle += sliceAngle;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                this.vertices.push(x);
                this.vertices.push(y);
                this.vertices.push(z);

                const textS = slice > this.slices 
                    ? (this.slices - slice*2) / this.slices
                    : slice * 2 / this.slices;
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
            this.indices.push(...[p1, p2, p4]);
            this.indices.push(...[p4, p3, p1]);
        }

        for(let i = 0; i < this.vertices.length; i+=3){
            this.normals.push(this.vertices[i], this.vertices[i + 1], 0);
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
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

