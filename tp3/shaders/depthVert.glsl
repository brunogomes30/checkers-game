#version 300 es
precision highp float;

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

out vec3 vNormal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

void main(){
    vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);
    vNormal = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));
    gl_Position = uPMatrix * vertex;
}