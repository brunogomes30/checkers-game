import { MyAnimation } from "../../animations/MyAnimation.js";
import { MyKeyframeAnimation } from "../../animations/MyKeyframeAnimation.js";
import { processClass } from "../../parser/components/processClass.js";
import { CheckersBoard } from "../model/CheckersBoard.js";

export class PieceController {

    constructor(scene, lightController) {
        this.scene = scene;
        this.selectedPiece = null;
        this.lightController = lightController;
        this.animatingMove = false;
        this.animatingCapture = false;
    }


    handlePieceClick(piece) {
        this.selectedPiece = piece;
    }

    movePiece(piece, y, x, callback = null) {
        this.stopIdleAnimation(piece, () => {
            this.translate(piece, y, x, callback);
        });

    }

    translate(pieceComponent, y, x, callback = null) {
        const animation = this.scene.graph.cloneAnimation('piece-move', 'piece-move-' + pieceComponent.id, {
            'posx': x,
            'posz': y
        });
        pieceComponent.addAnimation(animation);
        this.lightController.turnSpotlightOn(pieceComponent);
        animation.hookFunction(() => {
            this.lightController.followComponent(pieceComponent);
        });
        this.scene.graph.stopAnimation(animation, () => {
            this.lightController.turnSpotlightOff();
            animation.applyToComponent(pieceComponent);
            this.animatingMove = false;
            if (callback != null) {
                callback();
            }

        });
    }

    moveToStorage(piece, checkersStorage, board) {
        const STORAGE_OFFSET = [0, 0.0, 0];
        const color = piece.color;
        const component = piece.component;
        const storage = this.scene.graph.getComponent(color + '-storage');
        const storagePieces = checkersStorage;
        //Get the next available storage space
        let spaceChosen;
        for (let i = storagePieces.length - 1; i >= 0; i--) {
            spaceChosen = i;
            if (i === 0) {
                storagePieces[i].push(component);
                break;
            }
            if (storagePieces[i - 1].length > storagePieces[i].length) {
                storagePieces[i].push(component);
                break;
            }
        }
        let offset = [
            STORAGE_OFFSET[0] + (spaceChosen % 2) * (0.250) + Math.random() * 0.025,
            STORAGE_OFFSET[1] + storagePieces[spaceChosen].length * 0.055,
            STORAGE_OFFSET[2] + Math.floor(spaceChosen / 2) * 0.250 + Math.random() * 0.025,
        ]

        this.animatingCapture = true;
        this.jumpPiece(component, storage.getPosition(), offset, () => {
            this.animatingCapture = false;
        });

        if (piece.isKing) {
            const kingComponent = piece.component;
            //Move the king's piece to storage
            const deadPieces = kingComponent.children.filter(child => child.className == kingComponent.className);
            if (deadPieces.length > 0) {
                //Seperate pieces
                const deadPiece = deadPieces[0];

                //Remove from king
                kingComponent.children = kingComponent.children.filter(child => child != deadPiece);
                deadPiece.position = [...kingComponent.position];
                deadPiece.transformation = [...kingComponent.transformation];

                //Add to board
                board.component.children.push(deadPiece);
                spaceChosen = (spaceChosen + 1) % checkersStorage.length;
                offset = [
                    STORAGE_OFFSET[0] + (spaceChosen % 2) * (0.250) + Math.random() * 0.025,
                    STORAGE_OFFSET[1] + storagePieces[spaceChosen].length * 0.055,
                    STORAGE_OFFSET[2] + Math.floor(spaceChosen / 2) * 0.250 + Math.random() * 0.025,
                ]
                this.jumpPiece(deadPiece, storage.getPosition(), offset);
            }

        }
    }

    generatePieceComponent(boardComponent, color, offset, id) {
        let className;
        switch (color) {
            case 'white':
                className = 'white-piece';
                break;
            case 'black':
                className = 'black-piece';
                break;
        }
        const originalComponent = this.scene.graph.getComponent(className);
        const component = originalComponent.clone();
        //Offset the piece to the center of the tile

        component.translate(...offset);
        component.id = id;
        processClass(className, component);
        // Add the component to the scene graph
        this.scene.graph.addComponent(boardComponent, component);
        return component;
    }
    generatePieceComponentInBoard(boardComponent, color, y, x) {
        const { translationX, translationZ } = calculateBoardPosition(y, x);
        const id = 'piece-' + y + '-' + x;
        return this.generatePieceComponent(boardComponent, color, [translationX, 0, translationZ], id);
    }


    stopIdleAnimation(pieceComponent, callback = undefined) {
        const animation = pieceComponent.getAnimation(
            (animation) => animation.id == 'piece-selected-' + pieceComponent.id
        );
        if (animation != undefined) {
            this.scene.graph.stopAnimation(animation, () => {
                //Function called after the animation is finished
                pieceComponent.removeAnimation(animation);
                if (callback != undefined) {
                    callback();
                }
            });
        }
    }

    startIdleAnimation(pieceComponent) {
        const animation = this.scene.graph.cloneAnimation('piece-selected', 'piece-selected-' + pieceComponent.id);
        pieceComponent.animation = animation;
    }


    makeKing(king, checkersBoard) {
        const boardComponent = checkersBoard.component;
        const kingComponent = king.pieceComponent;

        const color = king.className.includes('white') ? 'white' : 'black';
        //Get piece from storage
        const storagePieces = checkersBoard.storages[color];
        let pieceIndex;
        for (let i = storagePieces.length - 1; i >= 0; i--) {
            if (storagePieces[i].length > 0) {
                pieceIndex = i;
                break;
            }
        }
        const deadPieceComponent = storagePieces[pieceIndex].pop();

        //Move piece to top of the new king
        const offset = [0, 0.055, 0];
        this.jumpPiece(deadPieceComponent, kingComponent.getPosition(), offset, () => {
            //Attach piece to king
            console.log('Attaching piece to king');
            deadPieceComponent.position = [0, 0, 0];
            deadPieceComponent.transformation = mat4.create();
            deadPieceComponent.translate(...offset);
            for (let i = 0; i < deadPieceComponent.children.length; i++) {
                const model = deadPieceComponent.children[i];
                for (const key of Object.keys(model.objects)) {
                    if (key === 'length') {
                        continue;
                    }
                    const obj = model.objects[key];
                    obj.pieceComponent = kingComponent;
                }

            }
            kingComponent.children.push(deadPieceComponent);
            boardComponent.children = boardComponent.children.filter((child) => child.id !== deadPieceComponent.id);

        });

    }

    jumpPiece(pieceComponent, destination, offset = [0, 0, 0], callback = undefined) {
        const movement = calculateMove(pieceComponent.getPosition(), destination, offset);
    
        const height = movement[1] + 1;
        const peak = [movement[0] / 2, height, movement[2] / 2];
    
        const animationxz = this.scene.graph.cloneAnimation('piece-storage_xz', 'piece-storage_xz' + pieceComponent.id, {
            'posx': movement[0],
            'posz': movement[2],
            'posx_half': peak[0],
            'posz_half': peak[2],
        });
        const animationy = this.scene.graph.cloneAnimation('piece-storage_y', 'piece-storage_y' + pieceComponent.id, {
            'posy': movement[1],
            'posy_half': peak[1],
        });
        this.animatingCapture = true;
        pieceComponent.addAnimation(animationxz);
        pieceComponent.addAnimation(animationy);
        this.scene.graph.stopAnimation(animationxz, () => {
            animationxz.applyToComponent(pieceComponent);
            pieceComponent.removeAnimation(animationxz);
            animationy.applyToComponent(pieceComponent);
            pieceComponent.removeAnimation(animationy);
            if (callback != undefined) {
                callback();
            }
    
        });
        this.scene.graph.stopAnimation(animationy);
        this.animatingCapture = false;
    }
}


export function calculateBoardPosition(y, x) {
    const TILE_SIZE = 2 / 8;
    const START_X = -1 + TILE_SIZE / 2;
    const START_Z = -1 + TILE_SIZE / 2;
    const translationX = START_X + x * TILE_SIZE;
    const translationZ = START_Z + (7 - y) * TILE_SIZE;
    return { translationX, translationZ };
}

function calculateMove(source, destination, offset = [0, 0, 0]) {
    const movement = [
        destination[0] - source[0] + offset[0],
        destination[1] - source[1] + offset[1],
        destination[2] - source[2] + offset[2]
    ]
    return movement;
}
