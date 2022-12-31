import {CGFappearance} from '../../../../lib/CGF.js';

export class TileController{
    constructor(scene){
        this.scene = scene;
        this.highlightMaterial = new CGFappearance(scene);
        this.highlightMaterial.setAmbient(0.7, 0.0, 0.0, 1);
        this.highlightMaterial.setDiffuse(0.7, 0.0, 0.0, 1);
        this.highlightMaterial.setSpecular(1.0, 0.5, 0.5, 1);
        this.highlightMaterial.setShininess(10.0);
        this.highlightedTiles = [];
    }

    highlightTile(tile){
        tile.changeMaterial(this.highlightMaterial);
        this.highlightedTiles.push(tile);
    }

    unhiglightTiles(){
        this.highlightedTiles.forEach(tile => {
            tile.resetMaterial();
        });
        this.highlightedTiles = [];
    }

    getTileFragment(boardComponent, tiley, tilex){
        //Find the board model
        console.log(boardComponent);
        const boardModel = boardComponent.children.filter(child => child.className == 'board-model')[0];

        //Find the tile fragment
        const tileFragment = Object.keys(boardModel.objects).filter(key => {
            let child = boardModel.objects[key];
            let y = child.id.split('x')[0];
            y = Number(y.substring(y.search(/[0-9]/)));
            let x = Number(child.id.split('_')[0].split('x')[1]);
            return y == tiley && x == tilex;
        });

        return boardModel.objects[tileFragment[0]];
    }

}