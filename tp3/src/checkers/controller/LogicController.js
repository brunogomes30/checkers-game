export class LogicController {
    constructor() {
        this.state = 'beforeGame';
    }

    start() {
        this.state = 'pieceSelection';
        this.turn = 'white';
    }

    selectTile(board, piece) {
        // Check if selection is valid
        
        this.state = 'tileSelection';
        return true;
    }

    setPieceSelection(piece) {
    }

    processMove(tile) {
        console.log(tile)
        if (this.validMoves.includes(tile)) {
            return true;
        }

        return false;
    }

    getValidMoves(){
        this.validMoves = validMoves(board, piece)
        return this.validMoves;
    }
}

function validMoves(board, piece){

}