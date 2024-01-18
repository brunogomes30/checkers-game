export function pickHandler(component, scene) {
    let c;
    switch (component.className) {
        case 'white-piece':
            scene.triggerEvent('white-piece-click', component);
            break;
        case 'black-piece':
            scene.triggerEvent('black-piece-click', component);
            break;
        case 'tile':
            scene.triggerEvent('tile-click', component);
            break;
        case 'button':
            c = component.buttonComponent;
            processButton(c, scene);
            break;
    }
}

function processButton(component, scene){
    switch (component.className) {
        case 'undo-button':
            scene.triggerEvent('undo-button-click', component);
            break;
        case 'start-button':
            scene.triggerEvent('start-button-click', component);
            break;
        case 'view-button':
            scene.triggerEvent('view-button-click', component);
            break;
    }
}

