/**
 * Parses the given attributes and returns an object with the values read in the node or an error string if any of the attributes is missing
 * @param {Object} attributes 
 * @param {XMLReader} reader 
 * @param {XMLNode} node 
 * @param {String} id 
 * @returns 
 */
export function buildValues(attributes, reader, node, id) {
    const values = {};
    const keys = Object.keys(attributes);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const varType = attributes[key];
        let value;
        switch (varType) {
            case 'float':
                value = reader.getFloat(node, key, false);
                if (!(value != null && !isNaN(value)))
                    return `unable to parse '${key}' of the primitive properties for ID = ${id}`;
                break;
            case 'integer':
                value = reader.getInteger(node, key, false);
                if (!(value != null && !isNaN(value)))
                    return `unable to parse '${key}' of the primitive properties for ID = ${id}`;
                break;
        }
        values[key] = value;
    }

    return values;
}

/**
 * Truncates the given number to the given number of decimal places
 * @export
 * @param {Float} number
 * @param {Number} decimalPlaces
 * @return {Float} 
 */
export function truncateDecimalPlaces(number, decimalPlaces) {
    return Number.parseFloat(Number.parseFloat(number).toFixed(decimalPlaces));
}
