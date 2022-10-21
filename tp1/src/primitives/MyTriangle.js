import { CGFobject } from '../../../lib/CGF.js';
import { XMLscene } from '../XMLscene.js';
import { sinFromCos, triangleCos as triangleCos, vector2points, vectorCrossProduct, vectorNormalize, vectorSize } from './geometryUtils.js';
/**
 * MyTriangle
 * @constructor
 * @param {XMLscene} scene - Reference to MyScene object
 * @param {Number} id - ID of the triangle
 * @param {Object} values - Values of the Triangle
 * @param {Number} values.x1 - X1 coordinate of the Triangle
 * @param {Number} values.x2 - X2 coordinate of the Triangle
 * @param {Number} values.x3 - X3 coordinate of the Triangle
 * @param {Number} values.y1 - Y1 coordinate of the Triangle
 * @param {Number} values.y2 - Y2 coordinate of the Triangle
 * @param {Number} values.y3 - Y3 coordinate of the Triangle
 * @param {Number} values.z1 - Z1 coordinate of the Triangle
 * @param {Number} values.z2 - Z2 coordinate of the Triangle
 * @param {Number} values.z3 - Z3 coordinate of the Triangle
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

	/**
	 * Initializes the buffers of the triangle
	 * @memberof MyTriangle
	 * @private
	 */
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
		this.cosAlpha = triangleCos(this.sizeA, sizeB, this.sizeC);
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
	 * Updates the texture coordinates of the triangle
	 * @memberof MyTriangle
	 * @param {Number} length_s - Amplification factor in the S axis
	 * @param {Number} length_t - Amplification factor in the T axis
	 */
	updateTexCoords(length_s, length_t) {
		if (length_s == undefined || length_t == undefined) {
			return;
		}

		this.texCoords = [
			0, 1,
			(this.sizeA / length_s), 1,
			(this.sizeC * this.cosAlpha) / length_t, 1 - (this.sizeC * this.sinAlpha) / length_t
		];
		this.updateTexCoordsGLBuffers();
	}
}
