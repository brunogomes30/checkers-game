#version 300 es
precision highp float;

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

uniform bool uUseTexture;

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
    bool enabled;                   // Default: false
};

struct materialProperties {
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 emission;                  // Default: (0, 0, 0, 1)
    float shininess;                // Default: 0 (possible values [0, 128])
};

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform bool uLightEnabled;	// not being used
uniform bool uLightModelTwoSided;	// not being used

#define NUMBER_OF_LIGHTS 8

uniform vec4 uGlobalAmbient;

uniform lightProperties uLight[NUMBER_OF_LIGHTS];

uniform materialProperties uFrontMaterial;
uniform materialProperties uBackMaterial;

out vec4 vFinalColor;
out vec2 vTextureCoord;
out vec3 vertexPosition;
out vec3 vertexNormal;
out vec3 viewVector;

vec4 lighting(vec4 vertex, vec3 E, vec3 N) {

    vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

    for(int i = 0; i < NUMBER_OF_LIGHTS; i++) {
        if(uLight[i].enabled) {

            float att = 1.0;
            float spot_effect = 1.0;
            vec3 L = vec3(0.0);

            if(uLight[i].position.w == 1.0) {
                L = (uLight[i].position - vertex).xyz;
                float dist = length(L);
                L = normalize(L);

                if(uLight[i].spot_cutoff != 180.0) {
                    vec3 sd = normalize(vec3(uLight[i].spot_direction));
                    float cos_cur_angle = dot(sd, -L);
                    float cos_inner_cone_angle = cos(radians(clamp(uLight[i].spot_cutoff, 0.0, 89.0)));
                    spot_effect = pow(clamp(cos_cur_angle / cos_inner_cone_angle, 0.0, 1.0), clamp(uLight[i].spot_exponent, 0.0, 128.0));
                }

                att = 1.0 / (uLight[i].constant_attenuation + uLight[i].linear_attenuation * dist + uLight[i].quadratic_attenuation * dist * dist);

            } else {
                L = normalize(uLight[i].position.xyz);
            }

            float lambertTerm = max(dot(N, L), 0.0) * att;

            vec4 Ia = uLight[i].ambient * uFrontMaterial.ambient * 1.0;

            vec4 Id;


            float diffuseThreshold = 0.8;            
            if(att * lambertTerm > diffuseThreshold){
                Id = uLight[i].diffuse * uFrontMaterial.diffuse * 1.0;
            } else {
                Id = uLight[i].diffuse * uFrontMaterial.diffuse * 
                smoothstep(0.45, 0.5, att * lambertTerm);
            }


            
            vec4 Is = vec4(0.0, 0.0, 0.0, 0.0);
            
            if(lambertTerm > 0.0) {

                float specular = 0.0;
                vec3 R = reflect(-L, N);
                if(dot(N, L) > 0.0){
                        specular = smoothstep(0.9, 1.0, att * pow(max(dot(R, E), 0.0), uFrontMaterial.shininess));
                }
                Is = uLight[i].specular * uFrontMaterial.specular * specular;
            }


            vec4 color;
            if(uLight[i].position.w == 1.0){
                color = max(spot_effect * (Id + Is), Ia);
            } else {
                color = spot_effect * (Ia + Id + Is);
            }
            result += smoothstep(0.45, 0.5, att) * color;

        }
    }

    result += uGlobalAmbient * uFrontMaterial.ambient * 1.0 + uFrontMaterial.emission;
    result = clamp(result, vec4(0.0), vec4(1.0));

    return result;
}

void main() {

    // Transformed Vertex position
    vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);

    // Transformed normal position
    vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));

    vec3 eyeVec = -vec3(vertex.xyz);
    vec3 E = normalize(eyeVec);

    vFinalColor = lighting(vertex, E, N);

    gl_Position = uPMatrix * vertex;

    if(uUseTexture)
        vTextureCoord = aTextureCoord;

    vertexPosition = aVertexPosition;
    vertexNormal = N;
    viewVector = E;

}
