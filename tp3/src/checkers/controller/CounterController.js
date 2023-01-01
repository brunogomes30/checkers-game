import { TextElement } from '../../text/TextElement.js';
export class CounterController {
    constructor(scene) {
        this.scene = scene;
        this.count = {
            'white': 0,
            'black': 0
        }
        
    }
    
    incrementCounter(color, amount){
        this.count[color] += amount;
        this.update();
    }

    update(){
        const whiteCounter = this.scene.graph.getComponent('white-counter');
        const blackCounter = this.scene.graph.getComponent('black-counter');
        this.getTextElement(whiteCounter).text = this.count['white'].toString();
        this.getTextElement(blackCounter).text = this.count['black'].toString();
    }

    getTextElement(component){
        const l = component.children.find(child => child instanceof TextElement);
        return l;
    }
}