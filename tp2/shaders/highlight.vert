#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform sampler2D uSampler;

uniform float timeFactor;


uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;

#define NUMBER_OF_LIGHTS 8
struct lightProperties {
    vec4 position;                  // Default: (0, 0, 1, 0)
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 half_vector;
    vec3 spot_direction;            // Default: (0, 0, -1)
    float spot_exponent;            // Default: 0 (possible values [0, 128]
    float spot_cutoff;              // Default: 180 (possible values [0, 90] or 180)
    float constant_attenuation;     // Default: 1 (value must be >= 0)
    float linear_attenuation;       // Default: 0 (value must be >= 0)
    float quadratic_attenuation;    // Default: 0 (value must be >= 0)
    bool enabled;                   // Deafult: false
};

struct materialProperties {
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 emission;                  // Default: (0, 0, 0, 1)
    float shininess;                // Default: 0 (possible values [0, 128])
};

attribute vec4 uGlobalAmbient;
uniform lightProperties uLight[NUMBER_OF_LIGHTS];
uniform materialProperties uFrontMaterial;
uniform materialProperties uBackMaterial;

varying vec4 vColor;
varying vec2 vTextureCoord;

vec4 lighting(vec4 vertex, vec3 E, vec3 N) {

    vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

    for (int i = 0; i < NUMBER_OF_LIGHTS; i++) {
        if (uLight[i].enabled) {

            float att = 1.0;
            float spot_effect = 1.0;
            vec3 L = vec3(0.0);

            if (uLight[i].position.w == 1.0) {
                L = (uLight[i].position - vertex).xyz;
                float dist = length(L);
                L = normalize(L);

                if (uLight[i].spot_cutoff != 180.0) {
                    vec3 sd = normalize(vec3(uLight[i].spot_direction));
                    float cos_cur_angle = dot(sd, -L);
                    float cos_inner_cone_angle = cos(radians(clamp(uLight[i].spot_cutoff, 0.0, 89.0)));

                    spot_effect = pow(clamp(cos_cur_angle/ cos_inner_cone_angle, 0.0, 1.0), clamp(uLight[i].spot_exponent, 0.0, 128.0));
                }

                att = 1.0 / (uLight[i].constant_attenuation + uLight[i].linear_attenuation * dist + uLight[i].quadratic_attenuation * dist * dist);

            } else {
                L = normalize(uLight[i].position.xyz);
            }

            float lambertTerm = max(dot(N, L), 0.0);

            vec4 Ia = uLight[i].ambient * uFrontMaterial.ambient;

            vec4 Id = uLight[i].diffuse * uFrontMaterial.diffuse * lambertTerm;

            vec4 Is = vec4(0.0, 0.0, 0.0, 0.0);

            if (lambertTerm > 0.0) {
                vec3 R = reflect(-L, N);
                float specular = pow( max( dot(R, E), 0.0 ), uFrontMaterial.shininess);

                Is = uLight[i].specular * uFrontMaterial.specular * specular;
            }

            if (uLight[i].position.w == 1.0) 
               result += att * max(spot_effect * (Id + Is), Ia);
            else
               result += att * spot_effect * (Ia + Id + Is);
        }
    }

	result += uGlobalAmbient * uFrontMaterial.ambient  + uFrontMaterial.emission;
    result = clamp(result, vec4(0.0), vec4(1.0));

    return result;
}


vec4 get_current_color(vec4 vertex, vec3 normal) {
	vec3 E = normalize(-vec3(vertex.xyz));
	vec4 color = lighting(vertex, E, normal);
	return color;
}


uniform float scaleH;

void main() {
    vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);
    vec3 normal = normalize(vec3(uNMatrix * vec4(aVertexNormal, 0.0)));
    vColor = get_current_color(vertex, normal);
    vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal*length(aVertexPosition)*(scaleH - 1.0)*sin(timeFactor), 1.0);
}
