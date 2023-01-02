import { TextElement } from '../../text/TextElement.js';

export class MessageController {

    constructor(scene) {
        this.scene = scene;
        this.id = 0;
        this.messageDisplaying = false;
        this.forever = false;
        this.previousAnimation = undefined;
    }

    displayTopComponent(message, component, color, absolutePosition = undefined, forever = false) {
        if (this.messageDisplaying && !this.forever) {
            return;
        }

        if (this.forever) {
            this.stopAnimation(this.previousAnimation, () => {
                this.displayTopComponent(message, component, color, absolutePosition, false);
            });
        }
        const textAllComponent = this.scene.graph.getComponent('help-text');
        const textComponent = this.scene.graph.getComponent('help-text-text');
        const text = this.getTextElement(textComponent);
        text.text = message;
        const position = [...component.getPosition()];
        const xOffset = (color == 'white' ? -1 : 1) * message.length / 4 * 0.20;
        position[0] += xOffset * (color == 'white' ? 1 : -0.7);
        position[2] = position[2] * -1 + (color ?? 'white' ? 1.0 : -1);
        position[1] += 0.1;


        if (absolutePosition != undefined) {
            const mult = color === 'white' ? -1 : 1
            position[0] = absolutePosition[0] + xOffset / 2;
            position[1] = absolutePosition[1];
            position[2] = absolutePosition[2];
        }
        const rotation = color == 'white' ? 0 : Math.PI;
        const animation = this.scene.graph.cloneAnimation('message', 'message' + this.id++, {
            'x': position[0],
            'y': position[1],
            'z': position[2],
            'y2': position[1] + 0.001,
            'ry': rotation,
        });
        textAllComponent.addAnimation(animation);
        this.previousAnimation = animation;
        this.messageDisplaying = true;
        this.forever = forever;
        setTimeout(() => {
            this.stopAnimation(animation, () => {
                text.text = '';
                textAllComponent.animation = [];
                this.messageDisplaying = false;
            });
        }, forever ? 10000 : 1500);
    }

    stopAnimation(animation, callback) {
        const textAllComponent = this.scene.graph.getComponent('help-text');
        const textComponent = this.scene.graph.getComponent('help-text-text');
        const text = this.getTextElement(textComponent);
        this.scene.graph.stopAnimation(animation, () => {
            text.text = '';
            textAllComponent.animation = [];
            this.messageDisplaying = false;
            callback();
        });
    }



    getTextElement(component) {
        const l = component.children.find(child => child instanceof TextElement);
        return l;
    }
}