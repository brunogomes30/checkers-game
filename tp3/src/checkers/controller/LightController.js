import {switchLight} from '../../controllers/lights.js';

export class LightController{
    constructor(scene){
        this.scene = scene;
        this.SPOT_LIGHT_OFFSET = 1.75;
    }

     turnSpotlightOn(piece){
        

        const lights = this.scene.lights;
        this.lightsEnabled = [...this.scene.enabledLights];
        for(let i=0; i<lights.length; i++){
            //lights[i].disable();
        }

        const pieceSpotlightId = this.scene.graph.getLight('piece-spotlight');
        const index = this.scene.light_id_index[pieceSpotlightId];
        const pieceSpotlight = lights[index];
        let position = piece.getPosition();
        pieceSpotlight.setPosition(position[0], position[1] + this.SPOT_LIGHT_OFFSET, position[2], 1.0);
        //pieceSpotlight.setSpotDirection(0, -1, 0);
        pieceSpotlight.enable();
        //switchLight(this.scene, pieceSpotlightId, index);
     }

    turnSpotlightOff(){
        for(let key of Object.keys(this.scene.enabledLights)){
            if(key === 'length'){
                continue;
            }
            const index = this.scene.light_id_index[key];
            if(this.scene.enabledLights[key]){
                //this.scene.lights[index].enable();
            }
        }
        const pieceSpotlightId = this.scene.graph.getLight('piece-spotlight');
        const index = this.scene.light_id_index[pieceSpotlightId];
        const pieceSpotlight = this.scene.lights[index];
        pieceSpotlight.disable();

        
    }

    followComponent(component){
        const pieceSpotlightId = this.scene.graph.getLight('piece-spotlight');
        const index = this.scene.light_id_index[pieceSpotlightId];
        const pieceSpotlight = this.scene.lights[index];
        let position = component.getPosition();
        pieceSpotlight.setPosition(position[0], position[1] + this.SPOT_LIGHT_OFFSET, position[2], 1.0);
        //pieceSpotlight.setSpotDirection(position[0], position[1], position[2])
    }
}