import {parseCoordinates3D, parseCoordinates4D, parseColor} from "./utils.js"

/**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
export function parseLights(lightsNode, graph) {
    var children = lightsNode.children;

    graph.lights = [];
    graph.scene.enabledLights = [];
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {

        // Storing light information
        var global = [];
        var attributeNames = [];
        var attributeTypes = [];

        //Check type of light
        if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
            graph.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }
        else {
            attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
            attributeTypes.push(...["position", "color", "color", "color"]);
        }

        // Get id of the current light.
        var lightId = graph.reader.getString(children[i], 'id');
        if (lightId == null)
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (graph.lights[lightId] != null)
            return "ID must be unique for each light (conflict: ID = " + lightId + ")";

        // Light enable/disable
        var enableLight = true;
        var aux = graph.reader.getBoolean(children[i], 'enabled');
        if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
            graph.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

        enableLight = aux || 1;

        //Add enabled boolean and type name to light info
        global.push(enableLight);
        global.push(children[i].nodeName);

        grandChildren = children[i].children;
        // Specifications for the current light.

        nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        for (var j = 0; j < attributeNames.length; j++) {
            var attributeIndex = nodeNames.indexOf(attributeNames[j]);
            if (attributeIndex != -1) {
                if (attributeTypes[j] == "position")
                    var aux = parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId, graph);
                else
                    var aux = parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId, graph);

                if (!Array.isArray(aux))
                    return aux;

                global.push(aux);
            }
            else
                return "light " + attributeNames[i] + " undefined for ID = " + lightId;
        }

        // Gets the additional attributes of the spot light
        if (children[i].nodeName == "spot") {
            var angle = graph.reader.getFloat(children[i], 'angle');
            if (!(angle != null && !isNaN(angle)))
                return "unable to parse angle of the light for ID = " + lightId;

            var exponent = graph.reader.getFloat(children[i], 'exponent');
            if (!(exponent != null && !isNaN(exponent)))
                return "unable to parse exponent of the light for ID = " + lightId;

            var targetIndex = nodeNames.indexOf("target");

            // Retrieves the light target.
            var targetLight = [];
            if (targetIndex != -1) {
                var aux = parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId, graph);
                if (!Array.isArray(aux))
                    return aux;

                targetLight = aux;
            }
            else
                return "light target undefined for ID = " + lightId;

            global.push(...[angle, exponent, targetLight])
        }

        graph.lights[lightId] = global;
        graph.scene.enabledLights[lightId] = enableLight;
        numLights++;
    }

    if (numLights == 0)
        return "at least one light must be defined";
    else if (numLights > 8)
        graph.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

    graph.log("Parsed lights");
    return null;
}