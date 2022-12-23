#version 300 es
precision highp float;
out vec4 fragColor;

uniform sampler2D uSampler;
uniform sampler2D depthTexture;
uniform sampler2D colorTexture;

uniform float canvasWidth;
uniform float canvasHeight;

void main() {
	fragColor = texture(colorTexture, vec2((gl_FragCoord.x ) / canvasWidth, (gl_FragCoord.y ) / canvasHeight));
	// Outline effect
	float xIndex = gl_FragCoord.x;
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
				vec4 tex = texture(depthTexture, vec2((xIndex + float(i)) / canvasWidth, (yIndex + float(j)) / canvasHeight));
				sumX += tex * 1.0 * GX[i + 1][j + 1];
				sumY += tex * 1.0 * GY[i + 1][j + 1];
			}
		}
	}

	//Multiply depth factor by 5.0 to make it more visible
	sumX.a *= 10.0;
	sumY.a *= 10.0;

	float G = dot(sqrt(sumX * sumX + sumY * sumY), vec4(1.0, 1.0, 1.0, 1.0));

	if(G > 1.5 ){
		fragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
}