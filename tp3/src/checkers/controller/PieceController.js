import { MyAnimation } from "../../animations/MyAnimation.js";
import { MyKeyframeAnimation } from "../../animations/MyKeyframeAnimation.js";
import { processClass } from "../../parser/components/processClass.js";

export class PieceController{

    constructor(scene, lightController){
        this.scene = scene;
        this.selectedPiece = null;
        this.lightController = lightController;
    }


    handlePieceClick(piece){
        this.selectedPiece = piece;
    }

    movePiece(piece, y, x){

        this.stopIdleAnimation(piece, () => {
            const animation = this.scene.graph.cloneAnimation('piece-move', 'piece-move-' + piece.pieceComponent.id, {
                'posx': x,
                'posz': y
            });
            piece.pieceComponent.animation = animation;
            this.lightController.turnSpotlightOn(piece.pieceComponent);
            animation.hookFunction(() => {
                this.lightController.followComponent(piece.pieceComponent);
            });
            this.scene.graph.stopAnimation(animation, () => {
                this.lightController.turnSpotlightOff();
                animation.applyToComponent(piece.pieceComponent);
            });
        });
        
    }

    moveToStorage(piece){
        const STORAGE_OFFSET = [0, 1.0, 0];
        const color = piece.color;
        const component = piece.component;
        const storage = this.scene.graph.getComponent(color+'-storage');
        const movement = [
            storage.getPosition()[0] - component.getPosition()[0] + STORAGE_OFFSET[0],
            storage.getPosition()[1] - component.getPosition()[1] + STORAGE_OFFSET[1],
            storage.getPosition()[2] - component.getPosition()[2] + STORAGE_OFFSET[2]
        ]
        console.log(movement);

        
        const animation = this.scene.graph.cloneAnimation('piece-storage', 'piece-storage' + component.id, {
            'posx': movement[0],
            'posy': movement[1],
            'posz': movement[2],
            'posx_half': movement[0] / 2 ,
            'posy_half': movement[1] * 2,
            'posz_half': movement[2] / 2,
        });
        component.animation = animation;
        this.scene.graph.stopAnimation(animation);
    }

    generatePieceComponent(board, color, y, x){
        let className;
        switch(color){
            case 'white':
                className = 'white-piece';
            break;
            case 'black':
                className = 'black-piece';
            break;
        }
        const originalComponent = this.scene.graph.getComponent(className);
        const component = originalComponent.clone();
        const TILE_SIZE = 2 / 8;
        const START_X = -1 + TILE_SIZE / 2;
        const START_Z = -1 + TILE_SIZE / 2;
        //Offset the piece to the center of the tile
        const translationX = START_X + x * TILE_SIZE;
        const translationZ = START_Z + (7-y) * TILE_SIZE;
        component.translate(translationX, 0, translationZ);
        component.id = 'piece-' + y + '-' + x;
        processClass(className, component);
        // Add the component to the scene graph
        this.scene.graph.addComponent(board.component, component);

        return component;
    }


    stopIdleAnimation(piece, callback = undefined){
        const animation = piece.pieceComponent.animation;
        if(animation != undefined){
            this.scene.graph.stopAnimation(animation, () => {
                //Function called after the animation is finished
                piece.pieceComponent.animation = undefined;
                if(callback != undefined){
                    callback();
                }
            });
        }
    }

    startIdleAnimation(piece){
        const animation = this.scene.graph.cloneAnimation('piece-selected', 'piece-selected-' + piece.pieceComponent.id);
        piece.pieceComponent.animation = animation;
    }
}