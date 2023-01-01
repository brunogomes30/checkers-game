import { TextElement } from '../../text/TextElement.js';

export class ClockController{
    constructor(scene){
        this.scene = scene;
        this.currentPlayer = 'white';
        this.startGameClock();
        //Set every second to update the clock
        setInterval(() => {
            this.update();
        }, 1000);

    }

    setTimeCounting(playerColor){
        this.currentPlayer = playerColor;
    }

    startGameClock(){
        this.startTime = Date.now();
        this.times = {
            'white': 0,
            'black': 0
        };
    }

    getDuration(){
        return Date.now() - this.startTime;
    }

    displaySeconds(time){
        return Math.floor(time / 1000);
    }

    update(){
        const gameClock = this.scene.graph.getComponent('game-clock');
        const whiteClock = this.scene.graph.getComponent('white-clock');
        const blackClock = this.scene.graph.getComponent('black-clock');

        //Update game clock
        this.getTextElement(gameClock).text = this.displaySeconds(this.getDuration()).toString();

        this.times[this.currentPlayer]++;

        //Update player clocks
        this.getTextElement(whiteClock).text = this.times['white'].toString();
        this.getTextElement(blackClock).text = this.times['black'].toString();


    }

    getTextElement(component){
        const l = component.children.find(child => child instanceof TextElement);
        return l;
    }
}