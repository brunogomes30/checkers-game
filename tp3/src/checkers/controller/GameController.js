import { BoardController } from './BoardController.js';
import { ClockController } from './ClockController.js';
export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.clockController = new ClockController(scene, 'white');
        this.boardController = new BoardController(scene, 8, this.clockController);
        this.scene.addEvent('graphLoaded', (args) => this.boardController.loadNewBoard(args.graph, args.board));
        this.boardController.createBoard();
        
    }
}
