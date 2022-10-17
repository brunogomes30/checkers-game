import { CGFobject } from '../../../lib/CGF.js';
import { sinFromCos, trianngleCos, vector2points, vectorCrossProduct, vectorNormalize, vectorSize } from './geometryUtils.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param values - Coordinates of the triangle vertices 
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, values) {
		super(scene);
		this.id = id;
		this.x1 = values.x1;
		this.x2 = values.x2;
		this.x3 = values.x3;
		this.y1 = values.y1;
		this.y2 = values.y2;
		this.y3 = values.y3;
		this.z1 = values.z1;
		this.z2 = values.z2;
		this.z3 = values.z3;

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2
		];


		let a = vector2points([this.x1, this.y1, this.z1], [this.x2, this.y2, this.z2]);
		const b = vector2points([this.x2, this.y2, this.z2], [this.x3, this.y3, this.z3]);
		const c = vector2points([this.x1, this.y1, this.z1], [this.x3, this.y3, this.z3]);

		this.sizeA = vectorSize(a);
		const sizeB = vectorSize(b);
		this.sizeC = vectorSize(c);
		
		const normal = vectorNormalize(vectorCrossProduct(a, c));
		this.normals = [
			...normal,
			...normal,
			...normal
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
		this.cosAlpha = trianngleCos(this.sizeA, sizeB, this.sizeC);
		this.sinAlpha = sinFromCos(this.cosAlpha);

		this.texCoords = [
			0, 1,
			1, 1,
			1, 0
		];
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(lenght_s, lenght_t) {
		if (lenght_s == undefined || lenght_t == undefined) {
			return;
		}

		this.texCoords = [
			0, 1,
			(this.sizeA / lenght_s), 1,
			(this.sizeC * this.cosAlpha) / lenght_t, 1 - (this.sizeC * this.sinAlpha) / lenght_t
		];
		this.updateTexCoordsGLBuffers();
	}
}
