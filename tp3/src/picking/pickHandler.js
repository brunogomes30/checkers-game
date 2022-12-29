export function pickHandler(component, scene){
    console.log('Picked: ' + component.className);
    switch(component.className){
        case 'white-piece':
            scene.triggerEvent('white-piece-click', component);
            break;
        case 'black-piece':
            scene.triggerEvent('black-piece-click', component);
            break;
        case 'tile':
            scene.triggerEvent('tile-click', component);
            break;
    }
    
}