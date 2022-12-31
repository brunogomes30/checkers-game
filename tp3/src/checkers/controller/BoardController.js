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

    loadNewBoard(board){
        if(board != undefined){
            this.board = board;
        }
        const boardComponent = this.scene.graph.getComponent('board');
        this.checkersBoard.component = boardComponent;
        console.log(this);
        for(let y=0; y<this.ysize; y++){
            for(let x=0; x<this.xsize; x++){
                const tile = this.board[y][x];
                if(tile.piece != null){
                    const component = this.pieceController.generatePieceComponent(this.checkersBoard, tile.piece.color, y, x);
                    tile.piece = new CheckersPiece(this.scene, tile.piece.color, component);
                }
            }
        }
    }

    createBoard() {
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
                    this.board[y][x].piece = new CheckersPiece(this.scene, color, null);
                }
            }
        }
        this.addEventsToGraph();
    }

    addEventsToGraph(){
        this.scene.addEvent('tile-click', (component) => {
            this.handleBoardClick(component);
        });

        this.scene.addEvent('white-piece-click', (component) => {
            this.handlePieceClick(component);
        });

        this.scene.addEvent('black-piece-click', (component) => {
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
        const className = element.className;
        const component = element.pieceComponent;
        console.log('Piece click: ' + className + ' ' + component.id);
        if(this.selectedPiece != undefined){
            this.pieceController.stopIdleAnimation(this.selectedPiece);
        }
        this.selectedPiece = element;
        this.pieceController.startIdleAnimation(this.selectedPiece);

    }

}
