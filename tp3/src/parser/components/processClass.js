import {MyModel} from '../../primitives/MyModel.js';

export function processClass(className, component){
    switch(className){
        case 'board':
            processBoard(component);
            break;
        default:
            return;
    }
}

function processBoard(component){
    if(component.pickable){
        //set board model to pickable
        component.children.forEach(child => {
            if(child instanceof MyModel){
                //set all tiles to pickable
                child.setPickable(true, (id) => id.includes('tile'));
                child.setClass('tile', (id) => id.includes('tile'));
            }
        });
    }
}