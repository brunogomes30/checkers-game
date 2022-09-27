export class Component{
    constructor(scene, transformation, material, texture, children){
        this.scene = scene;
        this.transformation = transformation;
        this.material = material;
        this.texture = texture;
        this.children = children;
    }
}