import { CGFobject } from '../../../lib/CGF.js';
import { triangleSin, trianngleCos, vector2points, vectorCrossProduct, vectorNormalize, vectorSize } from './geometryUtils.js';
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


		let vec01 = vector2points({ x: this.x1, y: this.y1, z: this.z1 }, { x: this.x2, y: this.y2, z: this.z2 });
		const vec02 = vector2points({ x: this.x1, y: this.y1, z: this.z1 }, { x: this.x3, y: this.y3, z: this.z3 });
		const vec12 = vector2points({ x: this.x2, y: this.y2, z: this.z2 }, { x: this.x3, y: this.y3, z: this.z3 });

		const size01 = vectorSize(vec01);
		const size02 = vectorSize(vec02);
		const size12 = vectorSize(vec12);

		vec01 = vectorNormalize(vec01);

		const normal = [...Object.values(vectorNormalize(vectorCrossProduct(vec01, vec02)))];

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

		const cosAlpha = trianngleCos(size01, size12, size02);
		const sinAlpha = triangleSin(cosAlpha);
		// Clarify how to map texture coordinate
		this.texCoords = [
			0, 0,
			size12 / 1, 0,
			(size02 * cosAlpha) / 1, (size02 * sinAlpha) / 1
		];
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
