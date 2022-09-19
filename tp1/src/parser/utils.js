/**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
 export function parseCoordinates3D(node, messageError, graph) {
    var position = [];

    // x
    var x = graph.reader.getFloat(node, 'x');
    if (!(x != null && !isNaN(x)))
        return "unable to parse x-coordinate of the " + messageError;

    // y
    var y = graph.reader.getFloat(node, 'y');
    if (!(y != null && !isNaN(y)))
        return "unable to parse y-coordinate of the " + messageError;

    // z
    var z = graph.reader.getFloat(node, 'z');
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
    var position = []; 

    //Get x, y, z
    position = parseCoordinates3D(node, messageError, graph);

    if (!Array.isArray(position))
        return position;
    // w
    var w = graph.reader.getFloat(node, 'w');
    if (!(w != null && !isNaN(w)))
        return "unable to parse w-coordinate of the " + messageError;

    position.push(w);

    return position;
}

/**
 * Parse the color components from a node
 * @param {block element} node
 * @param {message to be displayed in case of error} messageError
 */
export function parseColor(node, messageError, graph) {
    var color = [];

    // R
    var r = graph.reader.getFloat(node, 'r');
    if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
        return "unable to parse R component of the " + messageError;

    // G
    var g = graph.reader.getFloat(node, 'g');
    if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
        return "unable to parse G component of the " + messageError;

    // B
    var b = graph.reader.getFloat(node, 'b');
    if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
        return "unable to parse B component of the " + messageError;

    // A
    var a = graph.reader.getFloat(node, 'a');
    if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
        return "unable to parse A component of the " + messageError;

    color.push(...[r, g, b, a]);

    return color;
}