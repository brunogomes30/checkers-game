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
        return this.playDuration - ((Date.now() - this.playStart) / 1000);
    }

    startGameClock() {
        this.startTime = Date.now();
        this.times = {
            'white': 0,
            'black': 0
        };

    }

    endGameClock() {
        this.startTime = null;
        this.times = null;

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

            this.times[this.currentPlayer]++;

            //Update accumulated clocks
            const whiteClock = this.scene.graph.getComponent('white-clock');
            this.getTextElement(whiteClock).text = this.times['white'].toString();

            const blackClock = this.scene.graph.getComponent('black-clock');
            this.getTextElement(blackClock).text = this.times['black'].toString();

            const whiteSingleClock = this.scene.graph.getComponent('white-single-clock');
            const blackSingleClock = this.scene.graph.getComponent('black-single-clock');

            // //Update play clock
            if (this.currentPlayer) {
                if (this.getRemainingTime() <= 0) {
                    this.currentPlayer = undefined;
                    this.boardController.endGame();
                } else {
                    if (this.currentPlayer == 'white') {
                        // Insert play clock component here
                        this.getTextElement(whiteSingleClock).text = Math.floor(this.getRemainingTime()).toString();
                    } else {
                        // Insert play clock component here
                        this.getTextElement(blackSingleClock).text = Math.floor(this.getRemainingTime()).toString();
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