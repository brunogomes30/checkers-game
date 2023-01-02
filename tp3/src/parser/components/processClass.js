import {MyModel} from '../../primitives/MyModel.js';

export function processClass(className, component){
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
        case 'black-storage':
            processStorage(component);
            break;
        case 'white-storage':
            processStorage(component);
            break;
        case 'game-clock':
            break;
        case 'white-clock':
            break;
        case 'black-clock':
            break;
        case 'undo-button':
            processButton(component);
            break;
        case 'start-button':
            processButton(component);
            break;
        case 'view-button':
            processButton(component);
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
                console.log('tile: ' , child);
                for(const key of Object.keys(child.objects)){
                    const obj = child.objects[key];
                    
                    if(!obj.id.includes('tile')){
                        continue;
                    }
                    
                    let y = obj.id.split('x')[0];
                    y = Number(y.substring(y.search(/[0-9]/)));
                    let x = Number(obj.id.split('_')[0].split('x')[1]);
                    obj.position = [x * 0.250, 0.25, y * 0.250];
                }
                
            }
        });
    }
}

function processPiece(component, className){
    component.children.forEach(child => {
        if(child instanceof MyModel){
            //set all tiles to pickable
            child.setPickable(true);
            child.setClass(className);
            child.genericSet('pieceComponent', component);
        }
    });
}

function processStorage(component){
    //Nothing to do here
}

function processButton(component){

    if(component.className = 'view-button'){
        console.log(component);
    }
    for(let i=0; i<component.children.length; i++){
        
        for(let j=0; j<component.children[i].children.length; j++){
            let child = component.children[i].children[j];
            if(child instanceof MyModel){
                //component.children[i].children[j] = child.clone();
                child = component.children[i].children[j];
                child.setPickable(true);
                child.setClass('button');
                console.log('Generic set button component: ' + component.id);
                child.genericSet('buttonComponent', component);
            }
        }
    }
}