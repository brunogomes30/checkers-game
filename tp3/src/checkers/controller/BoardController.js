import { CheckersBoard } from "../model/CheckersBoard.js";
import { calculateBoardPosition, PieceController } from "./PieceController.js";
import { CheckersPiece } from "../model/CheckersPiece.js";
import { CheckersTile } from "../model/CheckersTile.js";
import { LogicController, validMoves } from "./CheckersController.js";
import { LightController } from "./LightController.js";
import { TileController } from "./TileController.js";
import { CameraController } from "./CameraController.js";
import { CounterController } from "./CounterController.js";
import { StorageController } from "./StorageController.js";
import { MessageController } from "./MessageController.js";
import { Component } from "../../components/Component.js";
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
        this.storageController = new StorageController(scene);
        this.messageController = new MessageController(scene);
        this.locks = {};
        this.nlock = 0;
        this.normalPlayTime = 300;
        this.singlePlayTime = 60;

        this.scene.interface.gui.add(this, 'normalPlayTime').name('Normal play time');
        this.scene.interface.gui.add(this, 'singlePlayTime').name('Single play time');

    }

    loadNewBoard(graph, board) {
        if (board != undefined) {
            this.checkersBoard.board = board;
        }

        this.cameraController.setCamera(graph);
        const boardComponent = graph.getComponent('board');
        this.whitePieces = [];
        this.blackPieces = [];

        this.checkersBoard.component = boardComponent;
        board = this.checkersBoard.board;
        for (let y = 0; y < this.ysize; y++) {
            for (let x = 0; x < this.xsize; x++) {
                const tile = board[y][x];
                const tileFragment = this.tileController.getTileFragment(this.checkersBoard.component, y, x);
                tile.fragment = tileFragment;
                if (tile.piece != null) {
                    const id = 'piece-' + y + '-' + x;
                    const position = this.storageController.addToStorage(tile.piece, this.checkersBoard.storages[tile.piece.color]);
                    const component = this.pieceController.generatePieceComponent(this.checkersBoard.component, tile.piece.color, position, id);
                    this.checkersBoard.pieceMap[id] = tile.piece;
                    if (tile.piece.color === 'white') {
                        this.whitePieces.push(component);
                    } else {
                        this.blackPieces.push(component);
                    }
                }
            }
        }
        this.logicController.start()
        this.scene.interface.gui.add(this, 'movie').name('Movie');
        this.scene.interface.gui.add(this, 'undo').name('Undo');
        this.scene.interface.gui.add(this, 'startGame').name('Start game');


        this.counterController.update();
        //this.changeTurn('white');

    }


    startGame() {
        if (!this.canReceiveInput()) {
            return;
        }
        const lockId = ++this.nlock;
        this.lockInput(lockId);
        this.logicController.resetGame();
        this.logicController.start();
        const graph = this.scene.graph;
        // Generate storage components
        const whiteStorage = graph.getComponent('white-storage');
        const blackStorage = graph.getComponent('black-storage');
        this.checkersBoard.storages['white'] = this.storageController.generateStorage(whiteStorage, 'white');
        this.checkersBoard.storages['black'] = this.storageController.generateStorage(blackStorage, 'black');
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


        for (let i = 0; i < 12; i++) {
            const white = this.whitePieces[i];
            const black = this.blackPieces[i];

            //Detach kings

            this.detachKing(white);
            this.detachKing(black);
            this.jumpToBoard(white);
            this.jumpToBoard(black);
            
        }
        this.unlockInput(lockId);
        this.clockController.startGameClock();
        this.startingColor = 'black';
        this.startingTurn(this.startingColor);
    }

    detachKing(component){
        for(let j =0;j<component.children.length; j++){
            const child = component.children[j];
            if(child instanceof Component){
                const componentPiece  = this.checkersBoard.pieceMap[component.id];
                //Attach child to board
                this.checkersBoard.component.children.push(child);
                child.transformation = [...component.transformation];
                child.position = [...component.position];
                const piece = this.checkersBoard.pieceMap[component.id];
                piece.position = {...componentPiece.position};
                piece.isKing = false;
                componentPiece.isKing = false;
                //remove from component
                component.children.splice(j, 1);
                break;
            }
        }
    }

    jumpToBoard(component) {

        const piece = this.checkersBoard.pieceMap[component.id];

        const jumpAction = () => {
            let y = Number(component.id.split('-')[1]);
        let x = Number(component.id.split('-')[2]);
        piece.position = {};
        piece.position.y = y;
        piece.position.x = x;
        const translation = calculateBoardPosition(y, x, this.checkersBoard.component);
        const position = [translation.translationX, 0.15, translation.translationZ];
        //this.checkersBoard.pieceMap[component.id] = this.checkersBoard.board[y][x].piece;
        this.checkersBoard.board[y][x].piece = piece;
        this.checkersBoard.board[y][x].piece.component = component;
        const animId = ++this.nlock;
        this.lockInput(animId);
        this.pieceController.jumpPiece(component, position, [0, 0, 0], () => this.unlockInput(animId));
        this.pieceController.resetPieceComponent(component);
        }

        //unmakeKing
        if(piece.king){
            this.pieceController.unmakeKing(component, jumpAction);
        } else {
            jumpAction();
        }
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

    highlightTiles() {
        this.tileController.unhiglightTiles();
        this.validMoves = this.logicController.currentValidMoves();
        if (this.validMoves == undefined) {
            return;
        }
        for (let i = 0; i < this.validMoves.length; i++) {
            const move = this.validMoves[i].move;
            const board = this.checkersBoard.board;
            const fragment = board[move.y][move.x].fragment;
            this.tileController.highlightTile(fragment);
        }
    }

    handleBoardClick(element) {
        if (!this.canReceiveInput()) {
            this.messageController.displayTopComponent('Wait for animations to finish', element, this.currentColor);
            return;
        }


        if (this.gameOver) {
            console.log('Game Finished');
            return;
        }

        let y = element.id.split('x')[0];
        y = Number(y.substring(y.search(/[0-9]/)));
        let x = Number(element.id.split('_')[0].split('x')[1]);
        console.log('Board click: ' + y + ' ' + x);
        if (!this.logicController.selectTile({ x, y })) {
            this.tileController.unhiglightTiles();
            if (this.selectedPiece != undefined) {
                this.lockInput(++this.nlock);
                this.pieceController.stopIdleAnimation(this.selectedPiece,
                    () => this.unlockInput(this.nlock));
            }
            this.selectedPiece = undefined;
            this.highlightTiles();
            this.messageController.displayTopComponent('Invalid tile selection', element, this.currentColor);
            return;
        }

        this.playMove(y, x);


    }

    playMove(y, x) {
        const TILE_SIZE = 2 / 8;
        const currentColor = this.logicController.selectedPiece.color.includes('white') ? 'white' : 'black';
        // Stop highlighting previous valid moves (Maybe highligh only the selected tile)
        this.tileController.unhiglightTiles();

        const piece = this.checkersBoard.pieceMap[this.selectedPiece.id];
        const piecePos = { y: piece.position.y, x: piece.position.x };
        const moveResult = this.logicController.processMove();

        // Animate selected piece movement
        const movey = y - piecePos.y;
        const movex = x - piecePos.x;
        //const pieceMoved = this.selectedPieceElement;
        this.lockInput(++this.nlock);
        const animId = this.nlock;
        const moveCallback = () => {
            if (moveResult.promoted) {
                console.log('Promoting piece', piece)
                this.pieceController.makeKing(piece, this.checkersBoard,
                    () => this.unlockInput(animId)
                );
                /*
                if (!moveResult.changeTurn && !moveResult.gameOver) {
                    this.pieceController.startIdleAnimation(pieceMoved);
                }
                */
            } else {
                this.unlockInput(animId);
            }
        };
        this.pieceController.movePiece(this.selectedPiece, -movey * TILE_SIZE, movex * TILE_SIZE, moveCallback);


        // Move captured piece to the corresponding graveyard
        if (moveResult.capturedPiece != null) {
            this.lockInput(++this.nlock);
            const animId = this.nlock;
            this.pieceController.moveToStorage(
                moveResult.capturedPiece,
                this.checkersBoard.storages[moveResult.capturedPiece.color],
                this.checkersBoard,
                () => {
                    this.capturePiece(moveResult.capturedPiece.color == 'white' ? 'black' : 'white');
                    this.unlockInput(animId);
                }
            );
        }

        this.selectedPiece = undefined;
        // Check if game is over
        if (moveResult.gameOver) {
            this.gameOver = true
            this.clockController.endGameClock();
            if (moveResult.winner == null) {
                // Change to draw camera
            } else {
                if (moveResult.changeTurn) {
                    // Change to winner camera
                    this.cameraController.resetCamera(0.5, () => { this.cameraController.switchSides(1.5) })
                }
            }
            // Show game over screen and options
            console.log('Game over! Winner: ' + moveResult.winner);
        }

        // Setup next move
        this.highlightTiles();
        if (moveResult.changeTurn) {
            this.changeTurn(currentColor == 'white' ? 'black' : 'white', this.validMoves.length == 1);
            this.selectedPiece = undefined;
        } else {
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

    changeTurn(color, singlePossibleMove = false) {
        console.log('change turn', color);
        this.currentColor = color;
        // Change view and stuff
        this.lockInput(++this.nlock);
        const cameraMovementId = this.nlock;
        this.cameraController.resetCamera(0.5, () => {
            this.cameraController.switchSides(1.5);
            this.unlockInput(cameraMovementId);
        });
        this.currentColor = this.logicController.turn;
        this.clockController.setPlayTimer(this, singlePossibleMove ? this.singlePlayTime : this.normalPlayTime, color);
    }

    startingTurn(color) {
        console.log('Starting turn', color);
        
        // Change view and stuff
        if (this.currentColor != color || (this.currentColor == undefined && color == 'black')) {
            this.lockInput(++this.nlock);
            let cameraMovementId = this.nlock;
            this.cameraController.resetCamera(0.5, () => {
                this.cameraController.switchSides(1.5);
                this.unlockInput(cameraMovementId);
            });
        }
        this.logicController.turn = color;
        this.currentColor = color;
        this.clockController.setPlayTimer(this, this.normalPlayTime, color);
    }

    handlePieceClick(element) {
        if (!this.canReceiveInput()) {
            this.messageController.displayTopComponent('Wait for animations to finish', element.pieceComponent, this.currentColor);
            return;
        }


        if (this.gameOver) {
            console.log('Game Finished');
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
            const position = [...this.checkersBoard.component.position];
            const piecePosition = element.pieceComponent.getPosition();
            position[0] += piecePosition[0];
            position[1] += piecePosition[1] + 0.125;
            position[2] += piecePosition[2];
            this.messageController.displayTopComponent('Invalid piece selection', element.pieceComponent, this.currentColor, position);
            return;
        }

        this.selectPiece(checkerPiece.component);
        // Display new valid moves 

    }

    selectPiece(pieceComponent) {
        this.selectedPiece = pieceComponent;
        //this.selectedPieceElement = element;
        this.pieceController.startIdleAnimation(this.selectedPiece);


        // Stop highlighting previous valid moves
        // Animate piece selection
        this.tileController.unhiglightTiles();
        this.validMoves = this.logicController.getPieceValidMoves();
        this.highlightTiles();
        // Display new valid moves 

    }

    isAnimating() {
        return !this.canReceiveInput();
    }

    endGame() {
        this.gameOver = true;
        this.clockController.endGameClock();
        this.lockInput(++this.nlock);
        const animId = this.nlock;
        this.cameraController.resetCamera(0.5, () => {
            this.cameraController.switchSides(1.5);
            this.unlockInput(animId);
        });
        
        console.log(`Game over! Winner: ${this.logicController.turn == 'white' ? 'black': this.logicController.turn }: Reason: Time's up`);
    }

    undo() {
        if (!this.canReceiveInput()) {
            this.messageController.displayTopComponent('Wait for animation to finish', this.checkersBoard.component, this.currentColor, [0, 0.5, 0]);
            return;
        }

        const TILE_SIZE = 2 / 8;
        let undoResult = this.logicController.undo();
        if (undoResult == undefined) {
            this.messageController.displayTopComponent('There are no moves to undo', this.checkersBoard.component, this.currentColor, [0, 0.5, 0]);
            return;
        }

        // Switch turn
        this.changeTurn(undoResult.piece.color, this.logicController.currentValidMoves.length == 1);

        console.log(undoResult);

        // Relocate moved piece
        let y = undoResult.position.y - undoResult.move.y;
        let x = undoResult.position.x - undoResult.move.x;
        console.log('y: ' + y + ' x: ' + x)
        this.lockInput(++this.nlock);
        const translateId = this.nlock;
        this.pieceController.translate(undoResult.piece.component, - y * TILE_SIZE, x * TILE_SIZE,
            () => this.unlockInput(translateId)
        );

        // Relocate captured piece
        if (undoResult.capture != undefined) {
            const capturedPiece = this.checkersBoard.board[undoResult.capture.y][undoResult.capture.x].piece
            const { translationX, translationZ } = calculateBoardPosition(capturedPiece.position.y, capturedPiece.position.x)
            this.lockInput(++this.nlock);
            const captureId = this.nlock;
            this.pieceController.jumpPiece(capturedPiece.component, [translationX, 0, translationZ], [0, 0.15, 0], () => {
                if (capturedPiece.isKing) {
                    this.pieceController.makeKing(capturedPiece, this.checkersBoard, () => this.unlockInput(captureId));
                } else {
                    this.unlockInput(captureId);
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
            this.lockInput(++this.nlock);
            const promoteAnimId = this.nlock;
            this.pieceController.unmakeKing(promotedPiece, this.checkersBoard,
                () => this.unlockInput(promoteAnimId)
            );
        }

        
    }

    movie() {
        const states = [];
        for (const state of this.logicController.states) {
            states.push({ ...state });
        }

        const setupMovie = () => {
            this.tileController.unhiglightTiles();

            this.startGame();

            setTimeout(() => nextState(0), 2500);
        }


        const nextState = (stateIndex) => {
            if (stateIndex >= states.length) {
                return;
            }

            const state = states[stateIndex];
            // Select piece
            console.log(state)
            const piece = this.checkersBoard.board[state.position.y][state.position.x].piece;
            this.selectedPiece = 
            this.logicController.selectPiece(piece);
            this.selectPiece(piece.component);
            this.logicController.selectTile({ x: state.move.x, y: state.move.y });
            setTimeout(() => this.playMove(state.move.y, state.move.x), 500);

            setTimeout(() => nextState(stateIndex + 1), 3500);
        };

        if(this.selectedPiece != undefined){
        this.pieceController.stopIdleAnimation(this.selectedPiece, setupMovie);
        }else{
            setupMovie();
        }
    }

    capturePiece(color) {
        this.counterController.incrementCounter(color, 1);
    }

    undoCapture(color) {
        this.counterController.incrementCounter(color, -1);
    }


    lockInput(id) {
        this.locks[id] = true;
        console.log('Locking input: ' + id);
    }

    unlockInput(id) {
        delete this.locks[id];
        console.log('unlocking input: ' + id);
        if (this.canReceiveInput()) {
            this.highlightTiles();
        }
    }

    canReceiveInput() {
        console.log('locks ', this.locks);
        return Object.keys(this.locks).length == 0;
    }

}
