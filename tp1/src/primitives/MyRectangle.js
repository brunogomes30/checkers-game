import { CGFobject } from '../../../lib/CGF.js';
import { MySceneGraph } from '../MySceneGraph.js';
/**
 * MyRectangle
 * @constructor
 * @param {XMLscene} scene - Reference to MyScene object
 * @param {Number} id - ID of the rectangle
 * @param {Object} values - Values of the Rectangle
 * @param {Number} values.x1 - X1 coordinate of the Rectangle
 * @param {Number} values.x2 - X2 coordinate of the Rectangle
 * @param {Number} values.y1 - Y1 coordinate of the Rectangle
 * @param {Number} values.y2 - Y2 coordinate of the Rectangle
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
	
	/**
	 * Initializes the buffers of the rectangle
	 * @memberof MyRectangle
	 * @private
	 */
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

	updateTexCoords(length_s, length_t){
		if (length_s == undefined || length_t == undefined){
			return;
		}
		
		this.texCoords = [
			0, this.yDist/ length_t ,
			this.xDist / length_s,  this.yDist / length_t,
			0, 0,
			this.xDist/ length_s , 0
		]
        
		this.updateTexCoordsGLBuffers();
	
    }
}

