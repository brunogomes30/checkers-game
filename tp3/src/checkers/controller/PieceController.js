import { MyAnimation } from "../../animations/MyAnimation.js";
import { MyKeyframeAnimation } from "../../animations/MyKeyframeAnimation.js";
import { processClass } from "../../parser/components/processClass.js";

export class PieceController{

    constructor(scene){
        this.scene = scene;
        this.selectedPiece = null;
    }

    hasPieceSelected(){
        return this.selectedPiece != null;
    }

    handlePieceClick(piece){
        this.selectedPiece = piece;
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
        const translation = mat4.create();
        mat4.translate(translation, translation, [translationX, 0, translationZ]);
        mat4.multiply(translation, translation, component.transformation);
        component.transformation = translation;
        component.id = 'piece-' + y + '-' + x;
        processClass(className, component);
        // Add the component to the scene graph
        this.scene.graph.addComponent(board.component, component);
        console.log(board.component);

        return component;
    }


    stopIdleAnimation(piece){
        const animation = piece.pieceComponent.animation;
        if(animation != undefined){
            this.scene.graph.stopAnimation(animation, () => {
                //Function called after the animation is finished
                piece.pieceComponent.animation = undefined;
            });
        }
    }

    startIdleAnimation(piece){
        //const animation = new MyKeyframeAnimation(this.scene, 'idle-animation', keyframes);
        const animation = this.scene.graph.cloneAnimation('piece-selected', 'piece-selected-' + piece.pieceComponent.id);
        piece.pieceComponent.animation = animation;
    }
}