import { CGFobject } from '../../../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {
	constructor(scene, id, values) {
		super(scene);
		this.id = id;
		this.x1 = values.x1;
		this.x2 = values.x2;
		this.y1 = values.y1;
		this.y2 = values.y2;

	
		this.xDist = Math.abs(this.x2 - this.x1);
		this.yDist = Math.abs(this.y2 - this.y1);

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y1, 0,	//1
			this.x1, this.y2, 0,	//2
			this.x2, this.y2, 0		//3
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	updateTexCoords(lenght_s, lenght_t){
		if (lenght_s == undefined || lenght_t == undefined){
			return;
		}
		
		this.texCoords = [
			0, this.yDist/ lenght_t ,
			this.xDist / lenght_s,  this.yDist / lenght_t,
			0, 0,
			this.xDist/ lenght_s , 0
		]
        
		this.updateTexCoordsGLBuffers();
	
    }
}

