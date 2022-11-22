/**
 * Parse the coordinates from a node with ID = id
 * @param {XMLNode} node - the node to parse
 * @param {String} messageError - message to be displayed in case of error
 */
export function parseCoordinates3D(node, messageError, graph) {
    const position = [];

    // x
    const x = graph.reader.getFloat(node, 'x', false);
    if (!(x != null && !isNaN(x)))
        return "unable to parse x-coordinate of the " + messageError;

    // y
    const y = graph.reader.getFloat(node, 'y', false);
    if (!(y != null && !isNaN(y)))
        return "unable to parse y-coordinate of the " + messageError;

    // z
    const z = graph.reader.getFloat(node, 'z', false);
    if (!(z != null && !isNaN(z)))
        return "unable to parse z-coordinate of the " + messageError;

    position.push(...[x, y, z]);

    return position;
}

/**
 * Parse the coordinates from a node with ID = id
 * @param {block element} node
 * @param {message to be displayed in case of error} messageError
 */
export function parseCoordinates4D(node, messageError, graph) {

    //Get x, y, z
    const position  = parseCoordinates3D(node, messageError, graph);
    if (!Array.isArray(position))
        return position;

    // Get w
    const w = graph.reader.getFloat(node, 'w', false);
    if (w == null || isNaN(w))
        return "unable to parse w-coordinate of the " + messageError;

    position.push(w);

    return position;
}

/**
 * Parse the color components from a node
 * @param {block element} node
 * @param {message to be displayed in case of error} messageError
 */
export function parseColor(node, messageError, graph, hasAlpha = true) {
    const color = [];

    // R
    const r = graph.reader.getFloat(node, 'r', false);
    if (!(r != null && !isNaN(r)))
        return "unable to parse r attribute of the " + messageError;
    if (r < 0 || r > 1) {
        return 'r attribute must be between [0, 1] of the ' + messageError;
    }

    // G
    const g = graph.reader.getFloat(node, 'g', false);
    if (!(g != null && !isNaN(g)))
        return "unable to parse g attribute of the " + messageError;
    if (g < 0 || g > 1) {
        return 'g attribute must be between [0, 1] of the ' + messageError;
    }

    // B
    const b = graph.reader.getFloat(node, 'b', false);
    if (!(b != null && !isNaN(b)))
        return "unable to parse b attribute of the " + messageError;
    if (b < 0 || b > 1) {
        return 'b attribute must be between [0, 1] of the ' + messageError;
    }

    if(hasAlpha){
        // A
        const a = graph.reader.getFloat(node, 'a', false);
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse a attribute of the " + messageError;
        if (a < 0 || a > 1) {
            return 'a attribute must be between [0, 1] of the ' + messageError;
        }
        color.push(...[r, g, b, a]);
        return color;
    }
    color.push(...[r, g, b]);
    return color;
}