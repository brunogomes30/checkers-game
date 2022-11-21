#ifdef GL_ES
precision highp float;
#endif


uniform float timeFactor;
uniform float redValue;
uniform float greenValue;
uniform float blueValue;
uniform sampler2D uSampler;

varying vec4 vColor;
varying vec2 vTextureCoord;



void main() {
	// Get the current color
	vec4 color = vColor * texture2D(uSampler, vTextureCoord);
	vec4 finalColor = vec4(vec3(redValue, greenValue, blueValue), 1.0);
	vec4 mixedColor = mix(color, finalColor, sin(timeFactor));
	gl_FragColor = mixedColor;
}