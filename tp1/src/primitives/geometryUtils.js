
/**
 * Returns vector from p1 to p2
 * @export
 * @param {Array} p1 - 3d point
 * @param {Array} p2 - 3d point
 * @return {Array} - 3d vector 
 */
export function vector2points(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
}

/**
 * Inverts a 3d vector
 * @export
 * @param {Array} vec - 3d vector
 * @return {Array} - 3d vector
 */
export function vectorInvert(vec) {
    return [-vec[0], -vec[1], -vec[2]];
}

/**
 * Returns the size of a 3d vector
 * @export
 * @param {Array} vec - 3d vector
 * @return {Number} - size of the vector
 */
export function vectorSize(vec) {
    return (vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2) ** (0.5);
}

/**
 * Returns the normalized vector
 * @export
 * @param {Array} vec - 3d vector to be normalized
 * @return {Array} - 3d normalized vector
 */
export function vectorNormalize(vec) {
    const dist = vectorSize(vec);
    return [vec[0] / dist, vec[1] / dist, vec[2] / dist];
}

/**
 * Returns the cross product of two 3d vectors
 * @export
 * @param {Array} vec1 - 3d vector
 * @param {Array} vec2 - 3d vector
 * @return {Array} - 3d vector
 * @see https://en.wikipedia.org/wiki/Cross_product
 */
export function vectorCrossProduct(vec1, vec2) {
    return [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0]
    ];
}

/**
 * TODO:: Add description
 * @export
 * @param {Number} a 
 * @param {Number} b
 * @param {Number} c
 * @return {Number}
 */
export function trianngleCos(a, b, c) {
    return (a ** 2 - b ** 2 + c ** 2) / (2 * a * c);
}

/**
 * Returns the sine from the cosine
 * @export
 * @param {Number} cos - cosine
 * @return {Number} - sine
 */
export function sinFromCos(cos) {
    return (1 - cos ** 2) ** (0.5);
}

/**
 * Converts degrees to radians
 * @export
 * @param {Number} deg - degrees
 * @return {Number} - radians
 */
export function degToRad(deg) { return (Math.PI * deg) / 180; }

export const RADIANS_CIRCLE = 2 * Math.PI;
