export function buildValues(attributes, reader, node){
    const values = [];
    const keys = Object.keys(attributes);
    for(let i=0; i < keys.length; i++){
        const key = keys[i];
        const varType = attributes[key];
        let value;
        switch(varType){
            case 'float':
                value = reader.getFloat(node, key);
                if (!(value != null && !isNaN(value)))
                    return `unable to parse ${key} of the primitive coordinates for ID = ${id}`;
                break;
            case 'integer':
                //bloat
                break;
        }
        values.push({key: value});
    }
    return values;
}