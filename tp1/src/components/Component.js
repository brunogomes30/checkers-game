export class Component{
    constructor(scene, transformation, materials, texture, children){
        this.scene = scene;
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
    }

    getMaterial(){
        return this.materials != undefined && this.materials.length > 0
            ? this.materials[0]
            : undefined;
    }
}