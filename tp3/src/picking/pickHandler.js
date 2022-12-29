export function pickHandler(component, graph){
    console.log('Picked: ' + component.className);
    switch(component.className){
        case 'white_piece':
            graph.triggerEvent('piece-click', component);
            break;
        case 'black_piece':
            graph.triggerEvent('piece-click', component);
            break;
        case 'tile':
            graph.triggerEvent('tile-click', component);
            break;
    }
    
}