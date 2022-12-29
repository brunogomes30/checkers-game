import {MyModel} from '../../primitives/MyModel.js';

export function processClass(className, component){
    console.log('Processing component: ' , component);
    switch(className){
        case 'board':
            processBoard(component);
            break;
        case 'white-piece':
            processPiece(component, className);
            break;
        case 'black-piece':
            processPiece(component, className);
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

function processPiece(component, className){
    //Bloat the piece
    console.log('Bloating piece: ' , component);
    component.children.forEach(child => {
        if(child instanceof MyModel){
            //set all tiles to pickable
            child.setPickable(true);
            child.setClass(className);
            child.genericSet('pieceComponent', component);
        }
    });
}