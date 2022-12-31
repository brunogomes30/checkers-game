import { BoardController } from './BoardController.js';

export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.boardController = new BoardController(scene, 8);
        this.scene.addEvent('graphLoaded', (args) => this.boardController.loadNewBoard(args.graph, args.board));
        this.boardController.createBoard();
    }
}
