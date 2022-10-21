import { CGFcamera, CGFcameraOrtho } from "../../../lib/CGF.js";
import { parseCoordinates3D } from "./utils.js";


/**
 * Parses the <views> block.
 * @param {XMLNode} viewsNode - The views block element.
 * @param {MySceneGraph} graph - The scene graph.
 */
export function parseView(viewsNode, graph) {
    graph.scene.cameras = {};
    let cameras = graph.scene.cameras;

    graph.scene.defaultCameraId = graph.reader.getString(viewsNode, 'default', false);
    if (graph.scene.defaultCameraId == null) {
        return `Default camera not set`;
    }

    for (let viewNode of viewsNode.children) {
        let viewType = viewNode.nodeName
        if (viewType != 'perspective' && viewType != 'ortho') {
            graph.onXMLMinorError(`Unknown camera tag < ${viewType} >`);
            continue;
        }

        let viewId = graph.reader.getString(viewNode, 'id', false);
        if (viewId == null || viewId == '') {
            return `No ID defined for a ${viewType} block`;
        }
        if (viewId in cameras) {
            graph.onXMLMinorError(`ID must be unique for each camera (conflict: ID = '${viewId}')`);
            continue;
        }

        let res

        let near = graph.reader.getFloat(viewNode, 'near', false);
        res = testFloat(near, 'near', viewType, viewId)
        if (res != null) {
            return res;
        }

        let far = graph.reader.getFloat(viewNode, 'far', false);
        res = testFloat(far, 'far', viewType, viewId)
        if (res != null) {
            return res;
        }

        let childrenNames = []
        for (let child of viewNode.children) {
            childrenNames.push(child.nodeName);
        }

        let fromNode = viewNode.children[childrenNames.indexOf('from')]
        if (fromNode == undefined) {
            return `'from' block not defined in ${viewType} ${viewId}`
        }
        let from = parseCoordinates3D(fromNode, `'from' tag of ${viewType} ${viewId}`, graph)
        if (!Array.isArray(from)) {
            return from;
        }


        let toNode = viewNode.children[childrenNames.indexOf('to')]
        if (toNode == undefined) {
            return `'to' block not defined in view ${viewId}`
        }
        let to = parseCoordinates3D(toNode, `'to' tag of ${viewType} ${viewId}`, graph)
        if (!Array.isArray(to)) {
            return to;
        }



        if (viewType == 'perspective') {
            let fov = graph.reader.getFloat(viewNode, 'angle', false);
            res = testFloat(fov, 'angle', 'view', viewId)
            if (res != null) {
                return res;
            }

            cameras[viewId] = new CGFcamera(fov * Math.PI / 180, near, far, vec3.fromValues(...from), vec3.fromValues(...to));
        }
        else {
            const left = graph.reader.getFloat(viewNode, 'left', false);
            res = testFloat(left, 'left', viewType, viewId)
            if (res != null) {
                return res;
            }

            const right = graph.reader.getFloat(viewNode, 'right', false);
            res = testFloat(right, 'right', viewType, viewId)
            if (res != null) {
                return res;
            }

            const top = graph.reader.getFloat(viewNode, 'top', false);
            res = testFloat(top, 'top', viewType, viewId)
            if (res != null) {
                return res;
            }

            const bottom = graph.reader.getFloat(viewNode, 'bottom', false);
            res = testFloat(bottom, 'bottom', viewType, viewId)
            if (res != null) {
                return res;
            }

            const upNode = viewNode.children[childrenNames.indexOf('up')]
            let up;
            if (upNode == undefined) {
                up = [0, 1, 0];
            }
            else {
                up = parseCoordinates3D(upNode, `'up' tag of ${viewType} ${viewId}`, graph)
                if (!Array.isArray(up)) {
                    return up;
                }
                
                // Only one element is allowed, and must be 1
                if(up[0] + up[1] + up[2] !== 1 || ((up[0] != 0 && up[0] != 1) || (up[1] != 0 && up[1] != 1) || (up[2] != 0 && up[2] != 1))){
                    graph.onXMLMinorError(`Invalid 'up' tag of ${viewType} ${viewId}. Only one coordinate can be 1, assuming x=0 y=1 z=0`);
                    up = [0, 1, 0];
                }
            }


            cameras[viewId] = new CGFcameraOrtho(left, right, bottom, top, near, far, vec3.fromValues(...from), vec3.fromValues(...to), vec3.fromValues(...up))
        }
    }
    if (cameras[graph.scene.defaultCameraId] == undefined) {
        return "Couldn't find default camera with id " + graph.scene.defaultCameraId;
    }
    return;
}

function testFloat(value, attribute, block, id) {
    if (value == null || isNaN(value)) {
        return `Invalid value of ${attribute} attribute. In ${block} ${id}`;
    }
    return null;
}