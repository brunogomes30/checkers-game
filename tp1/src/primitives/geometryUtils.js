export function vector2points(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2] ];
}

export function vectorInvert(vec) {
    return [-vec[0], -vec[1], -vec[2] ];
}

export function vectorSize(vec) {
    return (vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2) ** (0.5);
}

export function vectorNormalize(vec) {
    const dist = vectorSize(vec);
    return [vec[0] / dist,vec[1] / dist, vec[2] / dist ];
}

export function vectorCrossProduct(vec1, vec2) {
    return [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0]
    ];
}

export function trianngleCos(a, b, c) {
    return (a ** 2 - b ** 2 + c ** 2) / (2 * a * c);
}

export function sinFromCos(cos) {
    return (1 - cos ** 2) ** (0.5);
}

export function degToRad(deg) { return (Math.PI * deg) / 180; }

export const RADIANS_CIRCLE = 2 * Math.PI;

export function distance(x1, y1, z1, x2, y2, z2){
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2 +(z1 - z2)**2);
}

export function vectorSum(vec1, vec2){
    return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
}

export function vectorDiff(vec1, vec2){
    return [vec1[0] - vec2[0], vec1[1] - vec2[1], vec1[2] - vec2[2]];
}

export function vectorMult(vec1, a){
    return [vec1[0] * a, vec1[1] * a, vec1[2] * a];
}
