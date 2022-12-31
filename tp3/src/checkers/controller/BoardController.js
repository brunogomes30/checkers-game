import { CheckersBoard } from "../model/CheckersBoard.js";
import { PieceController } from "./PieceController.js";
import { CheckersPiece } from "../model/CheckersPiece.js";
import { CheckersTile } from "../model/CheckersTile.js";
import { LogicController } from "./CheckersController.js";
export class BoardController {
    constructor(scene, size) {
        this.scene = scene;
        this.ysize = size;
        this.xsize = size;
        this.pieceController = new PieceController(scene);
        this.checkersBoard = new CheckersBoard(scene, size, null);
        this.logicController = new LogicController(this.checkersBoard);
    }

    loadNewBoard(graph, board) {
        if (board != undefined) {
            this.checkersBoard.board = board;
        }

        const boardComponent = graph.getComponent('board');
        this.checkersBoard.component = boardComponent;
        board = this.checkersBoard.board;
        for (let y = 0; y < this.ysize; y++) {
            for (let x = 0; x < this.xsize; x++) {
                const tile = board[y][x];
                if (tile.piece != null) {
                    const component = this.pieceController.generatePieceComponent(this.checkersBoard, tile.piece.color, y, x);
                    tile.piece.component = component;
                    this.checkersBoard.pieceMap[component.id] = tile.piece;
                }
            }
        }

        this.logicController.start()
    }

    createBoard() {
        this.checkersBoard.board = [];

        for (let y = 0; y < this.ysize; y++) {
            this.checkersBoard.board.push([]);
            for (let x = 0; x < this.xsize; x++) {
                this.checkersBoard.board[y].push(new CheckersTile(this.scene, y, x));
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
                if (createPiece) {
                    this.checkersBoard.board[y][x].piece = new CheckersPiece(this.scene, color, null, { x, y });
                }
            }
        }
        this.addEventsToScene();
    }

    addEventsToScene() {
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

    handleBoardClick(element) {

        console.log('Board click: ' + element.id);
        let y = element.id.split('x')[0];
        y = Number(y.substring(y.search(/[0-9]/)));
        let x = Number(element.id.split('_')[0].split('x')[1]);

        if (!this.logicController.selectTile({x, y})) {
            console.log('Invalid tile selection');
            return;
        }

        // Stop highlighting previous valid moves (Maybe highligh only the selected tile)
        this.selectedTile = element;
        
        
        const moveResult = this.logicController.processMove();
        
        // Animate piece movement
        if (moveResult.capturedPiece != null) {
            // Move captured piece to the corresponding graveyard
        }

        if (moveResult.gameOver){
            // Deselct piece
            
            if ( moveResult.winner == null){
                // Change to draw camera
            }else {
                if (moveResult.changeTurn){
                    // Change to winner camera
                }
            }

            // Show game over screen and options
            console.log('Game over! Winner: ' + moveResult.winner)
        }

        if (moveResult.changeTurn){
            // Change view and stuff
            // Deselct piece
            this.selectedPiece = null;
        } else {
            // Highlight new valid moves
        }

        
    }

    handlePieceClick(element) {
        const className = element.className;
        const component = element.pieceComponent;
        console.log('Piece click: ' + className + ' ' + component.id);
        const checkerPiece = this.checkersBoard.pieceMap[element.pieceComponent.id];

        if (this.selectedPiece != null) {
            //this.pieceController.stopIdleAnimation(this.selectedPiece);
        }

        const selectionResult = this.logicController.selectPiece(checkerPiece);
        if (selectionResult === 'changeTurn'){
            // Stop highlighting previous valid moves
            // Change view and stuff
            this.selectedPiece = null;
            return;
        }

        if (!selectionResult) {
            console.log('Invalid piece selection');
            return;
        }

        this.selectedPiece = checkerPiece;
        //this.pieceController.startIdleAnimation(this.selectedPiece);

        // Stop highlighting previous valid moves
        // Animate piece selection
        this.validMoves = this.logicController.getValidMoves();
        console.log(this.validMoves);
        // Display new valid moves 
    }
}
