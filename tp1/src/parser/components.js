import {Component} from '../components/Component.js'
/**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
 export function parseComponents(componentsNode, graph) {
    const componentNodes = componentsNode.children;
    
    graph.components = [];

    let grandChildren = [];
    const grandgrandChildren = [];

    // Any number of components.
    for (let i = 0; i < componentNodes.length; i++) {
        if (componentNodes[i].nodeName !== "component") {
            graph.onXMLMinorError("unknown tag <" + componentNodes[i].nodeName + ">");
            continue;
        }

        // Get id of the current component.
        const componentID = graph.reader.getString(componentNodes[i], 'id');
        if (componentID === null)
            return "no ID defined for componentID";

        // Checks for repeated IDs.
        if (graph.components[componentID] !== undefined)
            return "ID must be unique for each component (conflict: ID = " + componentID + ")";

        grandChildren = componentNodes[i].children;

        const nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        const transformationIndex = nodeNames.indexOf("transformation");
        const materialsIndex = nodeNames.indexOf("materials");
        const textureIndex = nodeNames.indexOf("texture");
        const childrenIndex = nodeNames.indexOf("children");

        
        // Transformations

        // Materials

        // Texture

        // Children
        const childrenNodes = grandChildren[childrenIndex].children;
        const componentChildren = [];
        for(let i=0; i < childrenNodes.length; i++){
            const child = childrenNodes[i];
            const id = graph.reader.getString(child, "id");
            if(child.nodeName === 'primitiveref'){
                componentChildren.push(graph.primitives[id]);
            } else if(child.nodeName === 'componentref'){
                componentChildren.push(id);
            } else {
                graph.onXMLMinorError("unknown tag <" + componentNodes[i].nodeName + ">");
            }
            
        }
        const component = new Component(null, null, null, componentChildren);
        graph.components[componentID] = component;
    }


    // Change all component reference strings to the component reference
    for(const key in graph.components){
        const component = graph.components[key];
        for(const childKey in component.children){
            const child = component.children[childKey];
            if(child instanceof String){
                component.children[child] = graph.components[child];
            }

        }
        
    }
    return null;
}