#version 300 es
precision highp float;

in vec4 vFinalColor;
in vec2 vTextureCoord;

out vec4 fragColor;

uniform sampler2D uSampler;

uniform bool uUseTexture;

in vec3 vertexPosition;
in vec3 vertexNormal;
in vec3 viewVector;

void main() {
	// Branching should be reduced to a minimal. 
	// When based on a non-changing uniform, it is usually optimized.
	if (uUseTexture)
	{
		vec4 textureColor = texture(uSampler, vTextureCoord);
		fragColor = textureColor * vFinalColor;
	}
	else
		fragColor = vFinalColor;
	
	// Outline effect
	float threshold = 0.1;
	if(abs(dot(dFdx(vertexNormal), vec3(1.0, 1.0, 1.0))) > threshold || abs(dot(dFdy(vertexNormal), vec3(1.0, 1.0, 1.0))) > threshold ){
		fragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), fragColor, smoothstep(1.0, 1.2, abs(dot(viewVector, vertexNormal))));
	}

}