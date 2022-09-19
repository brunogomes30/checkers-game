/**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
export function parseMaterials(materialsNode, graph) {
    let children = materialsNode.children;

    graph.materials = [];

    let grandChildren = [];
    let nodeNames = [];

    // Any number of materials.
    for (let i = 0; i < children.length; i++) {

        if (children[i].nodeName != "material") {
            graph.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }

        // Get id of the current material.
        let materialID = graph.reader.getString(children[i], 'id');
        if (materialID == null)
            return "no ID defined for material";

        // Checks for repeated IDs.
        if (graph.materials[materialID] != null)
            return "ID must be unique for each light (conflict: ID = " + materialID + ")";

        //Continue here
        graph.onXMLMinorError("To do: Parse materials.");
    }

    //graph.log("Parsed materials");
    return null;
}