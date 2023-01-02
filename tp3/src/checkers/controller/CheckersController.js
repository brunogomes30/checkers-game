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

        if (piece.position == null) {
            console.log('Piece is dead')
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

        const board = clone(this.board.board);
        const position = { ...this.selectedPiece.position };

        // Move the piece
        let piecePos = this.selectedPiece.position
        this.board.board[this.selectedMove.move.y][this.selectedMove.move.x].piece = this.selectedPiece;
        this.board.board[piecePos.y][piecePos.x].piece = null;

        // Update the piece position and update if it's a king
        let promoted = false;
        this.selectedPiece.position = { y: this.selectedMove.move.y, x: this.selectedMove.move.x }
        if (this.selectedPiece.color === 'white' && this.selectedPiece.position.y === this.board.board.length - 1) {
            promoted = !this.selectedPiece.isKing;
            this.selectedPiece.isKing = true;
        } else if (this.selectedPiece.color === 'black' && this.selectedPiece.position.y === 0) {
            promoted = !this.selectedPiece.isKing;
            this.selectedPiece.isKing = true;
        }

        this.states.push({
            turn: this.turn,
            board: board,
            move: this.selectedMove.move,
            position: position,
            piece: { ...this.selectedPiece },
            capture: this.selectedMove.capture,
            promoted: promoted ? this.selectedPiece : undefined
        });

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
                this.state = 'pieceSelection';
                return { changeTurn: false, capturedPiece , promoted};
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

        return { changeTurn: true, capturedPiece, promoted };
    }

    undo() {
        console.log('Undoing');
        const previousState = this.states.pop();
        console.log('Undoing', previousState);
        if (previousState == undefined) {
            return;
        }

        this.board.board = previousState.board;
        this.board.board[previousState.position.y][previousState.position.x].piece.position = previousState.position;
        if (previousState.capture != undefined) {
            this.board.board[previousState.capture.y][previousState.capture.x].piece.position = previousState.capture;
        }
        if(previousState.promoted != undefined) {
            this.board.board[previousState.promoted.position.y][previousState.promoted.position.x].piece.isKing = false;
        }
        this.turn = previousState.turn;


        return {
            piece: {
                ...previousState.piece
            },
            move: previousState.move,
            position: previousState.position,
            capture: previousState.capture,
            promoted: previousState.promoted
        };
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

    currentValidMoves() {
        if (this.state == 'tileSelection') {
            return this.getPieceValidMoves();
        } else if(this.state == 'pieceSelection') {
            const allMoves = validMoves(this.board);
            const validmoves = [];
            for(const move of allMoves) {
                if(move.color === this.turn) {
                    move.move = move.from;
                    validmoves.push(move);
                }
            }
            return validmoves;
        }
        return [];

        
    }

}

export function validMoves(board) {
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


        // Moves for pawns
        const direction = piece.color === 'white' ? 1 : -1;
        const y = position.y + direction;

        for (let i = piece.isKing ? 0 : directions.indexOf(direction); piece.isKing ? i < directions.length : i == directions.indexOf(direction); i++) {
            const directionY = directions[i];
            for (let j = 0; j < directions.length; j++) {
                const directionX = directions[j];
                let y = position.y + directionY;
                let x = position.x + directionX;
                if (y >= 0 && y < board.ysize && x >= 0 && x < board.xsize) {
                    if (board.board[y][x].piece == null) {
                        pieceMoves.push({ move: { y, x }, from: position, color: piece.color });
                    } else {
                        checkCapture(board, piece, y, x, directionY, directionX, pieceMoves);
                    }
                }
            }
        }


        return pieceMoves;
    }

    function checkCapture(board, piece, y, x, directionY, directionX, pieceMoves) {
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
