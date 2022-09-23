
export function vector2points(p1, p2) {
    return { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
}

export function vectorInvert(vec) {
    return { x: -vec.x, y: -vec.y, z: -vec.z };
}

export function vectorSize(vec) {
    return (vec.x ** 2 + vec.y ** 2 + vec.z ** 2) ** (0.5);
}

export function vectorNormalize(vec) {
    const dist = vectorSize(vec);
    return { x: vec.x / dist, y: vec.y / dist, z: vec.z / dist };
}

export function vectorCrossProduct(vec1, vec2) {
    return {
        x: vec1.y * vec2.z - vec1.z * vec2.y, y: vec1.z * vec2.x - vec1.x * vec2.z,
        z: vec1.x * vec2.y - vec1.y * vec2.x
    };
}

export function trianngleCos(a, b, c) {
    return (a ** 2 - b ** 2 + c ** 2) / (2 * a * c);
}

export function triangleSin(cos) {
    return (1 - cos ** 2) ** (0.5);
}