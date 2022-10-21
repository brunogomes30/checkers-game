import { parseCoordinates3D, parseCoordinates4D, parseColor } from "./utils.js"

/**
 * Parses the <light> node.
 * @param {XMLNode} lightsNode - The lights block element.
 * @param {XMLScene} scene - The scene to parse
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
        let global = [];
        let tagNames = [];
        let tagTypes = [];

        //Check type of light
        if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
            graph.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }
        else {
            tagNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
            tagTypes.push(...["position", "color", "color", "color", "exclusive option"]);
        }

        // Get id of the current light.
        const lightId = graph.reader.getString(children[i], 'id', false);
        if (lightId == null)
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (graph.lights[lightId] != null)
            return "ID must be unique for each light (conflict: ID = " + lightId + ")";

        // Light enable/disable
        let enableLight = true;
        let aux = graph.reader.getBoolean(children[i], 'enabled', false);
        if (aux == null || isNaN(aux))
            graph.onXMLMinorError("unable to parse attribute 'enabled' for light ID = " + lightId + "; assuming 'enabled=1'");

        enableLight = aux;

        //Add enabled boolean and type name to light info
        global.push(enableLight);
        global.push(children[i].nodeName);

        grandChildren = children[i].children;
        // Specifications for the current light.

        nodeNames = [];
        for (let j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }
        for (let j = 0; j < tagNames.length; j++) {
            const attributeIndex = nodeNames.indexOf(tagNames[j]);
            if (attributeIndex == -1) {
                return "light " + tagNames[j] + " undefined for ID = " + lightId;
            }
            let aux;
            if (tagTypes[j] == "position") {
                aux = parseCoordinates4D(grandChildren[attributeIndex], "light position for ID =" + `'${lightId}'`, graph);
            } else if (tagTypes[j] == "exclusive option") {
                let constant = graph.reader.getFloat(grandChildren[attributeIndex], 'constant', false);
                if (constant == null || isNaN(constant) || (constant < 0 && constant > 1))
                    return `Unable to parse constant attenuation choice of the light '${lightId}'`;

                let linear = graph.reader.getFloat(grandChildren[attributeIndex], 'linear', false);
                if (linear == null || isNaN(linear) || (linear < 0 && linear > 1))
                    return `Unable to parse linear attenuation choice of the light '${lightId}'`;

                let quadratic = graph.reader.getFloat(grandChildren[attributeIndex], 'quadratic', false);
                if (quadratic == null || isNaN(quadratic) || (quadratic < 0 && quadratic > 1))
                    return `Unable to parse quadratic attenuation choice of the light '${lightId}'`;

                if (constant && linear || constant && quadratic || linear && quadratic) {
                    aux = `No two types of attenuation can be in use simultaneously. In light '${lightId}'`;
                } else if (!(constant || linear || quadratic)) {
                    graph.onXMLMinorError(`No attenuation value set for light '${lightId}'; using constant attenuation`);
                    aux = [1, 0, 0];
                }
                else
                    aux = [constant, linear, quadratic];
            }
            else {
                aux = parseColor(grandChildren[attributeIndex], tagNames[j] + " illumination for ID =" + lightId, graph);
            }

            if (!Array.isArray(aux))
                return aux;

            global.push(aux);

        }

        // Gets the additional attributes of the spot light
        if (children[i].nodeName == "spot") {
            const angle = graph.reader.getFloat(children[i], 'angle', false);
            if (angle == null || isNaN(angle))
                return "unable to parse angle of the light for ID = " + lightId;
            if ((angle < 0 || angle > 90) && angle != 180) {
                return "angle must be between [0, 90] or =180 for light with ID = " + lightId;
            }
            const exponent = graph.reader.getFloat(children[i], 'exponent');
            if (exponent == null || isNaN(exponent))
                return "unable to parse exponent of the light for ID = " + lightId;

            const targetIndex = nodeNames.indexOf("target");

            // Retrieves the light target.
            var targetLight = [];
            if (targetIndex != -1) {
                let aux = parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId, graph);
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