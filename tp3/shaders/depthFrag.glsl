#version 300 es
precision highp float;

in vec3 vertexPosition;
in vec3 vNormal;
in vec3 viewVector;

out vec4 fragColor;

float linearize_depth(float d,float zNear,float zFar)
{
    return zNear * zFar / (zFar + d * (zNear - zFar));
}

void main(){

    float near = 0.1;
    float far = 100.0;
    // depth
    //float linearDepth = linearize_depth((gl_FragCoord.z ), near, far);
    float depth = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) / (gl_DepthRange.far - gl_DepthRange.near);
    float linearDepth = (gl_FragCoord.z / gl_FragCoord.w) / far;
    fragColor = vec4((vNormal.xyz + vec3(1.0, 1.0, 1.0)) / 2.0, linearDepth);

    
}