import { TextElement } from '../../text/TextElement.js';

export class MessageController{

    constructor(scene){
        this.scene = scene;
        this.id = 0;
        this.messageDisplaying = false;
    }

    displayTopComponent(message, component, absolutePosition = undefined){
        if(this.messageDisplaying){
            return;
        }
        const textAllComponent = this.scene.graph.getComponent('help-text');
        const textComponent = this.scene.graph.getComponent('help-text-text');
        const text = this.getTextElement(textComponent);
        text.text = message;
        const position = [...component.getPosition()];
        position[0] += -message.length / 4 * 0.20 ;
        position[2] = position[2] * -1  + 1.0 ;
        position[1] +=  0.1 ;

        if(absolutePosition != undefined){
            position[0] = absolutePosition[0] -message.length / 8 * 0.20 ;
            position[1] = absolutePosition[1];
            position[2] = absolutePosition[2];
        }
        console.log('position: ', position);
        const animation = this.scene.graph.cloneAnimation('message', 'message' + this.id++, {
            'x': position[0],
            'y': position[1],
            'z': position[2],
            'y2': position[1] + 0.001,
            'ry': 0,
        });
        textAllComponent.addAnimation(animation);
        this.messageDisplaying = true;
        setTimeout(() => {
            this.scene.graph.stopAnimation(animation, () => {
                text.text = '';
                textAllComponent.animation = [];
                this.messageDisplaying = false;
            });
        }, 1500);
    }


    getTextElement(component){
        const l = component.children.find(child => child instanceof TextElement);
        return l;
    }
}