#version 300 es
precision highp float;

in vec4 vFinalColor;
in vec2 vTextureCoord;

out vec4 fragColor;

uniform sampler2D uSampler;
uniform sampler2D outlineTexture;



uniform bool uUseTexture;
uniform mat4 uMVMatrix;
uniform mat4 uNMatrix;
uniform float canvasWidth;
uniform float canvasHeight;


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
	/*
	float threshold = 0.000001;
	if(abs(dot(dFdx(vertexNormal), vec3(1.0, 1.0, 1.0))) > threshold || abs(dot(dFdy(vertexNormal), vec3(1.0, 1.0, 1.0))) > threshold ){
		fragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), fragColor, smoothstep(1.0, 1.2, abs(dot(viewVector, vertexNormal))));
	}

	fragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), fragColor, smoothstep(0.0, 0.50, abs(dot(viewVector, vertexNormal))));
	*/

	float xIndex = gl_FragCoord.x ;
	float yIndex = gl_FragCoord.y;
	mat3 GX = mat3(
		-1.0, 0.0, 1.0,
		-2.0, 0.0, 2.0,
		-1.0, 0.0, 1.0
	);
	
	mat3 GY = mat3(
		-1.0, -2.0, -1.0,
		0.0, 0.0, 0.0,
		1.0, 2.0, 1.0
	);

	vec4 sumX = vec4(0.0, 0.0, 0.0, 0.0);
	vec4 sumY = vec4(0.0, 0.0, 0.0, 0.0);

	if(xIndex > 0.0 && xIndex < canvasWidth - 1.0 && yIndex > 0.0 && yIndex < canvasHeight - 1.0){
		for(int i = -1; i <= 1; i++){
			for(int j = -1; j <= 1; j++){
				vec4 tex = texture(outlineTexture, vec2((xIndex + float(i)) / canvasWidth, (yIndex + float(j)) / canvasHeight));
				sumX += tex * 1.0 * GX[i + 1][j + 1];
				sumY += tex * 1.0 * GY[i + 1][j + 1];
			}
		}
	}

	//Multiply depth factor by 5.0 to make it more visible
	sumX.a *= 10.0;
	sumY.a *= 10.0;

	float G = dot(sqrt(sumX * sumX + sumY * sumY), vec4(1.0, 1.0, 1.0, 1.0));
	
	float angle = abs(dot(viewVector, vertexNormal));
	

	if(G > 1.5 ){
		fragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
	/*
	else if(abs(dot(dFdx(vertexNormal), vec3(1.0, 1.0, 1.0))) > 0.0001 || abs(dot(dFdy(vertexNormal), vec3(1.0, 1.0, 1.0))) > 0.0001 ){
		fragColor = mix(vec4(1.0, 0.0, 0.0, 1.0), fragColor, smoothstep(0.0, 0.2, angle));
	}
	*/
	
	

	//fragColor = texture(outlineTexture, vec2((xIndex ) / canvasWidth, (yIndex ) / canvasHeight));
	//vec4 tex = texture(outlineTexture, vTextureCoord);
	
	//fragColor = tex;
	/*
	if(dot(E, vertexNormal) < mix(0.2, 0.4, max(0.0, dot(vertexNormal, normalize(vec3(-9.8, -11.9, -10.0)))))){
		fragColor = vec4(0.0, 0.0, gl_FragCoord.z, 1.0);
	}
	*/
	

	


	
	

}