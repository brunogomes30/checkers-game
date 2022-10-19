export function buildValues(attributes, reader, node, id){
    const values = {};
    const keys = Object.keys(attributes);
    for(let i=0; i < keys.length; i++){
        const key = keys[i];
        const varType = attributes[key];
        let value;
        switch(varType){
            case 'float':
                value = reader.getFloat(node, key, false);
                if (!(value != null && !isNaN(value)))
                    return `unable to parse ${key} of the primitive coordinates for ID = ${id}`;
                break;
            case 'integer':
                value = reader.getInteger(node, key, false);
                if (!(value != null && !isNaN(value)))
                    return `unable to parse ${key} of the primitive coordinates for ID = ${id}`;
                break;
        }
        values[key] = value;
    }
    
    return values;
}

export function truncateDecimalPlaces(number, decimalPlaces){
    return Number.parseFloat(Number.parseFloat(number).toFixed(decimalPlaces));
}
