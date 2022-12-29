export function pickHandler(component, graph){
    console.log('Picked: ' + component.className);
    switch(component.className){
        case 'white-piece':
            graph.triggerEvent('white-piece-click', component);
            break;
        case 'black-piece':
            graph.triggerEvent('black-piece-click', component);
            break;
        case 'tile':
            graph.triggerEvent('tile-click', component);
            break;
    }
    
}