import { CheckersBoard } from "../model/CheckersBoard.js";
import { calculateBoardPosition, PieceController } from "./PieceController.js";
import { CheckersPiece } from "../model/CheckersPiece.js";
import { CheckersTile } from "../model/CheckersTile.js";
import { LogicController } from "./CheckersController.js";
import { LightController } from "./LightController.js";
import { TileController } from "./TileController.js";
import { CameraController } from "./CameraController.js";
import { CounterController } from "./CounterController.js";
export class BoardController {
    constructor(scene, size, clockController) {
        this.scene = scene;
        this.ysize = size;
        this.xsize = size;
        this.checkersBoard = new CheckersBoard(scene, size, null);
        this.logicController = new LogicController(this.checkersBoard);
        this.lightController = new LightController(scene)
        this.pieceController = new PieceController(scene, this.lightController);
        this.tileController = new TileController(scene);
        this.cameraController = new CameraController(scene);
        this.counterController = new CounterController(scene);
        this.clockController = clockController;
    }

    loadNewBoard(graph, board) {
        if (board != undefined) {
            this.checkersBoard.board = board;
        }
        
        this.cameraController.setCamera(graph);
        const boardComponent = graph.getComponent('board');

        this.checkersBoard.component = boardComponent;
        board = this.checkersBoard.board;
        for (let y = 0; y < this.ysize; y++) {
            for (let x = 0; x < this.xsize; x++) {
                const tile = board[y][x];
                const tileFragment = this.tileController.getTileFragment(this.checkersBoard.component, y, x);
                tile.fragment = tileFragment;
                if (tile.piece != null) {
                    const component = this.pieceController.generatePieceComponentInBoard(this.checkersBoard.component, tile.piece.color, y, x);
                    tile.piece.component = component;
                    this.checkersBoard.pieceMap[component.id] = tile.piece;
                }
            }
        }

        // Generate storage components
        const whiteStorage = graph.getComponent('white-storage');
        const blackStorage = graph.getComponent('black-storage');
        const whiteStoragePieces = this.checkersBoard.storages['white'];
        const blackStoragePieces = this.checkersBoard.storages['black'];

        for (let i = 0; i < 4; i++) {
            let position = whiteStorage.getPosition();
            position = [
                position[0] - 1.0,
                position[1] + 0.055 * i,
                position[2],
            ];
            const whitePiece = this.pieceController.generatePieceComponent(this.checkersBoard.component, 'white', position, 'piece-storage-white-' + i);
            position = blackStorage.getPosition();
            position = [
                position[0] - 1.0,
                position[1] + 0.055 * i,
                position[2],
            ];
            const blackPiece = this.pieceController.generatePieceComponent(this.checkersBoard.component, 'black', position, 'piece-storage-black-' + i);
            whiteStoragePieces[i].push(whitePiece);
            blackStoragePieces[i].push(blackPiece);
        }

        this.logicController.start()
        this.scene.interface.gui.add(this, 'undo').name('Undo');
        this.counterController.update();
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
        if (this.isAnimating()) {
            console.log('Board click: Animation in progress');
            return;
        }
        const TILE_SIZE = 2 / 8;
        let y = element.id.split('x')[0];
        y = Number(y.substring(y.search(/[0-9]/)));
        let x = Number(element.id.split('_')[0].split('x')[1]);
        console.log('Board click: ' + y + ' ' + x);
        if (!this.logicController.selectTile({ x, y })) {
            this.tileController.unhiglightTiles();
            if (this.selectedPiece != undefined) {
                this.pieceController.stopIdleAnimation(this.selectedPiece);
            }
            this.selectedPiece = undefined;

            console.log('Invalid tile selection');
            return;
        }
        const currentColor = this.logicController.selectedPiece.color.includes('white') ? 'white' : 'black';
        // Stop highlighting previous valid moves (Maybe highligh only the selected tile)
        this.tileController.unhiglightTiles();

        const piece = this.checkersBoard.pieceMap[this.selectedPiece.id]
        const piecePos = { y: piece.position.y, x: piece.position.x };
        const moveResult = this.logicController.processMove();

        // Animate selected piece movement
        const movey = y - piecePos.y;
        const movex = x - piecePos.x;
        const pieceMoved = this.selectedPieceElement;
        const moveCallback = () => {
            if (moveResult.promoted) {
                console.log(this.checkersBoard);
                console.log(pieceMoved);
                this.pieceController.makeKing(piece, this.checkersBoard);
                /*
                if (!moveResult.changeTurn && !moveResult.gameOver) {
                    this.pieceController.startIdleAnimation(pieceMoved);
                }
                */
            }
        }
        this.pieceController.movePiece(this.selectedPiece, - movey * TILE_SIZE, movex * TILE_SIZE, moveCallback);


        // Move captured piece to the corresponding graveyard
        if (moveResult.capturedPiece != null) {
            this.pieceController.moveToStorage(
                moveResult.capturedPiece,
                this.checkersBoard.storages[moveResult.capturedPiece.color],
                this.checkersBoard,
                () => this.capturePiece(moveResult.capturedPiece.color == 'white' ? 'black' : 'white')
            );
        }

        this.selectedPiece = undefined;
        // Check if game is over
        if (moveResult.gameOver) {

            if (moveResult.winner == null) {
                // Change to draw camera
            } else {
                if (moveResult.changeTurn) {
                    // Change to winner camera
                    this.cameraController.resetCamera(0.5 , () => {this.cameraController.switchSides(1.5)})
                }
            }

            // Show game over screen and options
            console.log('Game over! Winner: ' + moveResult.winner)
        }

        // Setup next move
        if (moveResult.changeTurn) {
            this.changeTurn(currentColor == 'white' ? 'black' : 'white');
            this.selectedPiece = undefined;
            // Change view and stuff
            this.cameraController.resetCamera(0.5 , () => {this.cameraController.switchSides(1.5)})
        }  else {
            /*

            this.validMoves = this.logicController.getPieceValidMoves();

            for (let i = 0; i < this.validMoves.length; i++) {
                const move = this.validMoves[i].move;
                const board = this.checkersBoard.board;
                const fragment = board[move.y][move.x].fragment;

                this.tileController.highlightTile(fragment);
            }

            this.pieceController.startIdleAnimation(this.selectedPiece);
            */
        }


    }

    changeTurn(color) {
        console.log('change turn', color);
        this.clockController.setTimeCounting(color);
    }

    handlePieceClick(element) {
        if (this.isAnimating()) {
            console.log('Piece click: Animation in progress');
            return;
        }
        const className = element.className;
        const component = element.pieceComponent;
        console.log('Piece click: ' + className + ' ' + component.id);
        const checkerPiece = this.checkersBoard.pieceMap[element.pieceComponent.id];
        if (checkerPiece == undefined) {
            return;
        }
        if (this.selectedPiece != undefined) {
            this.pieceController.stopIdleAnimation(this.selectedPiece);
        }

        const selectionResult = this.logicController.selectPiece(checkerPiece);
        if (!selectionResult) {
            console.log('Invalid piece selection');
            return;
        }

        this.selectedPiece = element.pieceComponent;
        this.selectedPieceElement = element;
        this.pieceController.startIdleAnimation(this.selectedPiece);


        // Stop highlighting previous valid moves
        // Animate piece selection
        this.tileController.unhiglightTiles();
        this.validMoves = this.logicController.getPieceValidMoves();

        console.log(this.validMoves);
        for (let i = 0; i < this.validMoves.length; i++) {
            const move = this.validMoves[i].move;
            const board = this.checkersBoard.board;
            const fragment = board[move.y][move.x].fragment;
            this.tileController.highlightTile(fragment);
        }
        // Display new valid moves 
        
    }

    isAnimating() {
        return this.pieceController.animatingCapture || this.pieceController.animatingMove || this.cameraController.animate != undefined;
    }

    undo() {
        if (this.pieceController.animatingCapture || this.pieceController.animatingMove) {
            console.log('Undo: Animation in progress');
            return;
        }

        const TILE_SIZE = 2 / 8;
        let undoResult = this.logicController.undo();
        if (undoResult == undefined) {
            console.log('No more undos');
            return;
        }

        console.log(undoResult);

        // Relocate moved piece
        let y = undoResult.position.y - undoResult.move.y;
        let x = undoResult.position.x - undoResult.move.x;
        console.log('y: ' + y + ' x: ' + x)
        this.pieceController.translate(undoResult.piece.component, - y * TILE_SIZE, x * TILE_SIZE);

        // Relocate captured piece
        if (undoResult.capture != undefined) {
            const capturedPiece = this.checkersBoard.board[undoResult.capture.y][undoResult.capture.x].piece
            console.log(capturedPiece);
            const { translationX, translationZ } = calculateBoardPosition(capturedPiece.position.y, capturedPiece.position.x)
            this.pieceController.jumpPiece(capturedPiece.component, [translationX, 0, translationZ], [0, 0.15, 0], () => {
                if (capturedPiece.isKing) {
                    this.pieceController.makeKing(capturedPiece, this.checkersBoard);
                }
                this.counterController.incrementCounter(capturedPiece.color === 'white' ? 'black' : 'white', -1);
            });
            this.pieceController.removeFromStorage(
                capturedPiece.component,
                 this.checkersBoard.storages[capturedPiece.color]);

        }

        // Relocate promoted piece
        if (undoResult.promoted != undefined) {
            const [y, x] = [undoResult.promoted.position.y, undoResult.promoted.position.x];
            const promotedPiece = this.checkersBoard.board[y][x].piece
            console.log(promotedPiece);
            this.pieceController.unmakeKing(promotedPiece, this.checkersBoard);
        }
    }

    capturePiece(color){
        this.counterController.incrementCounter(color, 1);
    }

    undoCapture(color){
        this.counterController.incrementCounter(color, -1);
    }

}
