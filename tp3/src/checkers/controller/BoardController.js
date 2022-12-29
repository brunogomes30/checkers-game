import { CheckersBoard } from "../model/CheckersBoard.js";
import { PieceController } from "./PieceController.js";
import { CheckersPiece } from "../model/CheckersPiece.js";
import { CheckersTile } from "../model/CheckersTile.js";
export class BoardController {
    constructor(scene, size) {
        this.scene = scene;
        this.ysize = size;
        this.xsize = size;
        this.pieceController = new PieceController(scene);
        const boardComponent = this.scene.graph.getComponent('board');
        this.checkersBoard = new CheckersBoard(scene, size, boardComponent);
    }

    init() {
        this.board = [];

        for (let y = 0; y < this.ysize; y++) {
            this.board.push([]);
            for (let x = 0; x < this.xsize; x++) {
                this.board[y].push(new CheckersTile(this.scene, y, x));
            }
        }
        // fill board with pieces
        for (let y = 0; y < this.ysize; y++) {
            for (let x = 0; x < this.xsize; x++) {
                let createPiece = false;
                let color = undefined;
                if ((y + x) % 2 == 0) {
                    if (y < 3) {
                        createPiece = true;
                        color = 'white';
                    } else if (y > 4) {
                        createPiece = true;
                        color = 'black';
                    }
                }
                if(createPiece){
                    const component = this.pieceController.generatePieceComponent(this.checkersBoard, color, y, x);
                    this.board[y][x].piece = new CheckersPiece(this.scene, color, component);
                }
            }
        }

        this.addEventsToGraph();
    }

    addEventsToGraph(){
        this.scene.graph.addEvent('tile-click', (component) => {
            this.handleBoardClick(component);
        });

        this.scene.graph.addEvent('piece-click', (component) => {
            this.handlePieceClick(component);
        });
    }

    handleBoardClick(element){
        console.log('Board click: ' + element.id);
        if(this.pieceController.hasPieceSelected()){
            //this.pieceController.movePiece(this.selectedPiece, y, x);
        }
    }

    handlePieceClick(element){
        if(this.selectedPiece != null){
            //this.pieceController.stopIdleAnimation(this.selectedPiece);
        }
        this.selectedPiece = element;
        //this.pieceController.startIdleAnimation(this.selectedPiece);

    }

}
