attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec2 dims;
uniform vec2 charCoords;

varying vec2 vTextureCoord;

void main() {

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	// top s coordinate of the character = charCoord[0] / dims[0] (e.g. 5 / 16)
	// char width in tex coords = 1.0 / dims[0] 
	// this vertex's s coordinate = top s coordinate of the char + the vertex texcoord * char width in texcoords
	//                            = charCoord[0] / dims[0] + aTextureCoord[0] * 1.0 / dims[0]
	//                            = (charCoord[0] + aTextureCoord[0]) / dims[0]
	// The same holds for the t coordinate, so:
	vTextureCoord = (charCoords + aTextureCoord) / vec2(16.0, 16.0);
}

