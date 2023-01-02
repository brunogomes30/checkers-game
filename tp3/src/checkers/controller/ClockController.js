import { TextElement } from '../../text/TextElement.js';

export class ClockController {
    constructor(scene, currentPlayer) {
        this.scene = scene;
        this.currentPlayer = currentPlayer;
        //Set every second to update the clock
        setInterval(() => {
            this.update();
        }, 1000);

    }


    setPlayTimer(boardController, playDuration, player) {
        this.currentPlayer = player;
        this.playDuration = playDuration;
        this.playStart = Date.now();
        this.boardController = boardController;
    }

    getRemainingTime() {
        return this.playDuration - ((Date.now() - this.playStart)/1000);
    }

    startGameClock() {
        this.startTime = Date.now();
    }

    endGameClock() {
        this.startTime = null;
    }

    getDuration() {
        return Date.now() - this.startTime;
    }

    displaySeconds(time) {
        return Math.floor(time / 1000);
    }

    update() {
        if (this.startTime) {
            //Update game clock
            const gameClock = this.scene.graph.getComponent('game-clock');
            this.getTextElement(gameClock).text = this.displaySeconds(this.getDuration()).toString();

            //Update player clock
            if (this.currentPlayer) {
                if (this.getRemainingTime() <= 0) {
                    this.currentPlayer = undefined;
                    this.boardController.endGame();
                } else {
                    if (this.currentPlayer == 'white') {
                        const whiteClock = this.scene.graph.getComponent('white-clock');
                        this.getTextElement(whiteClock).text = Math.floor(this.getRemainingTime()).toString();
                    } else {
                        const blackClock = this.scene.graph.getComponent('black-clock');
                        this.getTextElement(blackClock).text = Math.floor(this.getRemainingTime()).toString();
                    }
                }
            }
        }

    }

    getTextElement(component) {
        const l = component.children.find(child => child instanceof TextElement);
        return l;
    }
}