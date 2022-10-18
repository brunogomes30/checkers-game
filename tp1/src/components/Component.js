export class Component{
    constructor(scene, transformation, materials, texture, textureScaleFactor, children){
        this.scene = scene;
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.textureScaleFactor = textureScaleFactor;
        this.children = children;
    }

    getMaterial(){
        return this.materials != undefined && this.materials.length > 0
            ? this.materials[this.scene.materialIndex % this.materials.length]
            : undefined;
    }
}