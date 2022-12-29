import { BoardController } from './BoardController.js';

export class GameController {
    constructor(scene) {
        this.scene = scene;
        this.boardController = new BoardController(scene, 8);
        this.scene.addEvent('graphLoaded', () => this.boardController.loadNewBoard());
        this.boardController.createBoard();
        
    }
}