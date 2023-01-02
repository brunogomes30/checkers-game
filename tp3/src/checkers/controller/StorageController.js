export class StorageController{
    constructor(scene){
        this.scene = scene;
        this.STORAGE_OFFSET = [0, 0, 0];
        
    }


    addToStorage(piece, storagePieces){
        let storage = this.nextStorage(storagePieces, piece.color);
        storagePieces[storage.index].push(piece.component);
        return storage.position;
    }

    removeFromStorage(piece, storagePieces){
        let storage = this.lastStorage(storagePieces);
        storagePieces[storage.index].pop();
        return storage.position;
    }

    nextStorage(storagePieces, color){
        const storage = this.scene.graph.getComponent(color + '-storage');
        const spaceChosen = storagePieces.findIndex(pieces => pieces.length == Math.min(...storagePieces.map(pieces => pieces.length)));
        let offset = [
            storage.getPosition()[0] + (spaceChosen % 2) * (0.250) + Math.random() * 0.012,
            storage.getPosition()[1] + storagePieces[spaceChosen].length * 0.055,
            storage.getPosition()[2] + Math.floor(spaceChosen / 2) * 0.250 + Math.random() * 0.012,
        ];

        return {
            position: offset,
            index: spaceChosen
        }
    }

    lastStorage(storagePieces){
        const spaceChosen = storagePieces.findIndex(pieces => pieces.length == Math.max(...storagePieces.map(pieces => pieces.length)));
        let offset = [
            this.STORAGE_OFFSET[0] + (spaceChosen % 2) * (0.250) + Math.random() * 0.012,
            this.STORAGE_OFFSET[1] + storagePieces[spaceChosen].length * 0.055,
            this.STORAGE_OFFSET[2] + Math.floor(spaceChosen / 2) * 0.250 + Math.random() * 0.012,
        ];
        return {
            position: offset,
            index: spaceChosen
        }
    }

    generateStorage(){
        return [[], [], [], []];
    }
}