export class LogicController {
    constructor(board) {
        this.board = board;
        this.state = 'beforeGame';
        this.states = []
    }

    start() {
        this.state = 'pieceSelection';
        this.turn = 'white';
    }

    selectTile(tile) {
        if (this.state !== 'tileSelection' && this.state != 'multiCapture') {
            console.log('No piece selected yet')
            return false;
        }

        const move = this.getPieceValidMoves().filter((move) => move.move.x === tile.x && move.move.y === tile.y)[0];
        if (move === undefined) {
            this.state = 'pieceSelection';
            this.selectedPiece = null;
            console.log('Invalid tile selected');
            return false;
        }

        this.selectedMove = move;
        this.state = 'processMove'
        return true;
    }

    selectPiece(piece) {
        if (this.state !== 'pieceSelection' && this.state !== 'tileSelection') {
            return false;
        }

        // Check if selection is valid
        if (piece.color !== this.turn) {
            console.log(`Not ${this.turn} player's piece`)
            return false;
        }

        this.selectedPiece = piece;
        this.state = 'tileSelection';
        this.validMoves = validMoves(this.board)
        return true;
    }

    processMove() {
        if (this.state != 'processMove') {
            return false;;
        }

        this.states.push({ turn: this.turn, board: clone(this.board.board), move: this.selectedMove.move, piece: { ...this.selectedPiece }, capture: { ...this.selectedMove.capture } });
        console.log(this.states[this.states.length - 1]);
        // Move the piece
        let piecePos = this.selectedPiece.position
        this.board.board[this.selectedMove.move.y][this.selectedMove.move.x].piece = this.selectedPiece;
        this.board.board[piecePos.y][piecePos.x].piece = null;

        // Update the piece position
        this.selectedPiece.position = { y: this.selectedMove.move.y, x: this.selectedMove.move.x }

        // Handle captures
        let capturedPiece = null;
        if (this.selectedMove.capture != undefined) {
            capturedPiece = this.board.board[this.selectedMove.capture.y][this.selectedMove.capture.x].piece;
            capturedPiece.position = null;
            this.board.board[this.selectedMove.capture.y][this.selectedMove.capture.x].piece = null;

            // Re-run valid moves for the new position
            this.validMoves = validMoves(this.board);

            if (this.getPieceValidMoves().filter((move) => move.capture != undefined).length !== 0) {
                console.log('New multicapture moves: ', this.validMoves);
                this.state = 'multiCapture';
                return { changeTurn: false, capturedPiece };
            }
        }

        this.selectedPiece = null;
        this.selectedMove = null;
        this.turn = this.turn === 'white' ? 'black' : 'white';

        // Check if game is over
        let gameOverTest = checkGameOver(this.board, this.states, this.turn);
        if (gameOverTest.finished) {
            this.state = 'afterGame';
            return { changeTurn: gameOverTest.winner === undefined ? undefined : this.turn == gameOverTest, capturedPiece, gameOver: true, winner: gameOverTest.winner };
        }



        this.state = 'pieceSelection';
        return { changeTurn: true, capturedPiece };
    }

    getPieceValidMoves() {
        let validMoves = this.validMoves.filter((move) => move.color == this.selectedPiece.color);
        let capturing = false;
        let finalValidMoves = [];
        for (const move of validMoves) {
            if (move.capture != undefined) {
                capturing = true;
                break;
            }
        }

        finalValidMoves.push(...validMoves.filter((move) => (move.capture != undefined || !capturing) && move.from.x == this.selectedPiece.position.x && move.from.y == this.selectedPiece.position.y));

        return finalValidMoves;
    }

}

function validMoves(board) {
    let validMoves = [];

    for (let y = 0; y < board.ysize; y++) {
        for (let x = 0; x < board.xsize; x++) {
            if (board.board[y][x].piece != null) {
                validMoves.push(...pieceMoves(board, board.board[y][x].piece));
            }
        }
    }

    return validMoves;

    function pieceMoves(board, piece) {
        let pieceMoves = [];
        const position = piece.position;
        const directions = [-1, 1];

        if (!piece.isKing) {
            // Moves for pawns
            const direction = piece.color === 'white' ? 1 : -1;
            const y = position.y + direction;

            for (let i = 0; i < directions.length; i++) {
                const x = position.x + directions[i];
                if (y >= 0 && y < board.ysize && x >= 0 && x < board.xsize) {
                    if (board.board[y][x].piece == null) {
                        pieceMoves.push({ move: { y, x }, from: position, color: piece.color });
                    } else {
                        checkPawnCapture(board, piece, y, x, direction, directions[i], pieceMoves);
                    }
                }
            }

        } else {
            // Moves for kings
            for (let i = 0; i < directions.length; i++) {
                const directionY = directions[i];
                for (let j = 0; j < directions.length; j++) {
                    const directionX = directions[j];
                    let capturing = undefined;
                    for (let y = position.y + directionY, x = position.x + directionX; y >= 0 && y < board.ysize && x >= 0 && x < board.xsize; y += directionY, x += directionX) {
                        if (board.board[y][x].piece == null) {
                            if (capturing !== undefined) {
                                // Found empty tile after capturing, add it to valid moves
                                pieceMoves.push({ move: { y, x }, capture: capturing });
                            } else {
                                pieceMoves.push({ move: { y, x } });
                            }
                        } else {
                            // Found piece, check if it can be captured and setting capturing to next tiles
                            // If capturing is already set, break the loop so no more pieces can be captured in this move
                            if (board.board[y][x].piece.color != piece.color && capturing === undefined) {
                                capturing = { x, y };
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
            }
        }

        return pieceMoves;
    }

    function checkPawnCapture(board, piece, y, x, directionY, directionX, pieceMoves) {
        if (board.board[y][x].piece.color != piece.color) {
            const y2 = y + directionY;
            const x2 = x + directionX;
            if (y2 >= 0 && y2 < board.ysize && x2 >= 0 && x2 < board.xsize && board.board[y2][x2].piece == null) {
                pieceMoves.push({ move: { y: y2, x: x2 }, capture: { y, x }, from: piece.position, color: piece.color });
            }
        }
    }
}

function checkGameOver(board, states, turn) {
    let finished = true;

    // Wins by no more possible moves
    for (let y = 0; y < board.ysize; y++) {
        for (let x = 0; x < board.xsize; x++) {
            if (board.board[y][x].piece != null && board.board[y][x].piece.color === turn) {
                if (validMoves(board, board.board[y][x].piece).length !== 0) {
                    finished = false;
                    break;
                }
            }
        }
    }

    if (finished) {
        const winner = turn === 'white' ? 'black' : 'white';
        return { finished, winner };
    }

    // Draw by repeating moves
    let statesWithoutRepeatingTurns = [];
    for (let i = 1; i < states.length; i++) {
        if (states[i].turn != states[i - 1].turn) {
            statesWithoutRepeatingTurns.pop()
            statesWithoutRepeatingTurns.push(states[i]);
        }
    }

    if (statesWithoutRepeatingTurns.length >= 20) {
        // Check if number of pieces has changed in the last 20 moves
        for (let i = 0; i < statesWithoutRepeatingTurns.length - 1; i++) {
            if (statesWithoutRepeatingTurns[i].capture != undefined) {
                return { finished: false, winner: null };
            }
        }

        // Check if the last 20 moves are done by kings
        let movesWhite = [];
        let movesBlack = [];
        for (let i = 0; i < statesWithoutRepeatingTurns.length - 1; i++) {
            if (!statesWithoutRepeatingTurns[i].piece.isKing) {
                return { finished: false, winner: null };
            }

            if (statesWithoutRepeatingTurns[i].piece.color === 'white') {
                movesWhite[statesWithoutRepeatingTurns.move] == undefined ? movesWhite[statesWithoutRepeatingTurns.move] = 1 : movesWhite[statesWithoutRepeatingTurns.move]++;
            } else {
                movesBlack[statesWithoutRepeatingTurns.move] == undefined ? movesBlack[statesWithoutRepeatingTurns.move] = 1 : movesBlack[statesWithoutRepeatingTurns.move]++;
            }
        }

        if (max(Object.values(movesWhite)) > max(Object.values(movesBlack)) + 1) {
            return { finished: true, winner: 'black' };
        }

        if (max(Object.values(movesBlack)) > max(Object.values(movesWhite)) + 1) {
            return { finished: true, winner: 'white' };
        }

        // Check number of kings
        let kingsWhite = 0;
        let kingsBlack = 0;
        for (let y = 0; y < board.ysize; y++) {
            for (let x = 0; x < board.xsize; x++) {
                if (board.board[y][x].piece != null) {
                    if (board.board[y][x].piece.color === 'white') {
                        kingsWhite++;
                    } else {
                        kingsBlack++;
                    }
                }
            }
        }

        if (kingsWhite === kingsBlack) {
            // Check number of pieces
            let piecesWhite = 0;
            let piecesBlack = 0;
            for (let y = 0; y < board.ysize; y++) {
                for (let x = 0; x < board.xsize; x++) {
                    if (board.board[y][x].piece != null && !board.board[y][x].piece.isKing) {
                        if (board.board[y][x].piece.color === 'white') {
                            piecesWhite++;
                        } else {
                            piecesBlack++;
                        }
                    }
                }
            }

            if (piecesWhite === piecesBlack) {
                return { finished: true, winner: null };
            }
            if (piecesWhite > piecesBlack) {
                return { finished: true, winner: 'white' };
            }
            return { finished: true, winner: 'black' };
        }

        if (kingsWhite > kingsBlack) {
            return { finished: true, winner: 'white' };
        }

        return { finished: true, winner: 'black' };
    }

    return { finished: false, winner: null };
}

function clone(items) { return items.map(item => Array.isArray(item) ? clone(item) : { ...item }); }
