export class PieceController{

    constructor(scene){
        this.scene = scene;
        this.selectedPiece = null;
    }

    hasPieceSelected(){
        return this.selectedPiece != null;
    }

    handlePieceClick(piece){
        this.selectedPiece = piece;
    }

    generatePieceComponent(board, color, y, x){
        let component = null;
        switch(color){
            case 'white':
            component = this.scene.graph.getComponent('white-piece');
            break;
            case 'black':
            component = this.scene.graph.getComponent('black-piece');
            break;
        }
        component = Object.assign(Object.create(Object.getPrototypeOf(component)), component);
        const TILE_SIZE = 2 / 8;
        const START_X = -1 + TILE_SIZE / 2;
        const START_Z = -1 + TILE_SIZE / 2;
        //Offset the piece to the center of the tile
        const translationX = START_X + x * TILE_SIZE;
        const translationZ = START_Z + y * TILE_SIZE;
        const translation = mat4.create();
        mat4.translate(translation, translation, [translationX, 0, translationZ]);
        mat4.multiply(translation, translation, component.transformation);
        component.transformation = translation;

        component.id = 'piece-' + y + '-' + x;
        console.log('component = ', component);
        // Add the component to the scene graph
        this.scene.graph.addComponent(board.component, component);

        return component;
    }
}