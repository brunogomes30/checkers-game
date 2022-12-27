import { CGFcamera, CGFcameraOrtho } from "../../../lib/CGF.js";
import { parseCoordinates3D } from "./utils.js";


/**
 * Parses the <views> block.
 * @param {XMLNode} viewsNode - The views block element.
 * 
 */
export function parseView(viewsNode, sxsReader) {
    let cameras = {};

    let defaultCameraId = sxsReader.reader.getString(viewsNode, 'default', false);
    if (defaultCameraId == null && this.mainFile === true) {
        return `Default camera not set on file ${sxsReader.filename}`;
    }

    for (let viewNode of viewsNode.children) {
        let viewType = viewNode.nodeName
        if (viewType != 'perspective' && viewType != 'ortho') {
            sxsReader.graph.onXMLMinorError(`Unknown camera tag < ${viewType} >`);
            continue;
        }

        let viewId = sxsReader.reader.getString(viewNode, 'id', false);
        if (viewId == null || viewId == '') {
            return `No ID defined for a ${viewType} block`;
        }
        if (viewId in cameras) {
            sxsReader.graph.onXMLMinorError(`ID must be unique for each camera (conflict: ID = '${viewId}')`);
            continue;
        }

        let res

        let near = sxsReader.reader.getFloat(viewNode, 'near', false);
        res = testFloat(near, 'near', viewType, viewId)
        if (res != null) {
            return res;
        }

        let far = sxsReader.reader.getFloat(viewNode, 'far', false);
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
        let from = parseCoordinates3D(fromNode, `'from' tag of ${viewType} ${viewId}`, sxsReader)
        if (!Array.isArray(from)) {
            return from;
        }


        let toNode = viewNode.children[childrenNames.indexOf('to')]
        if (toNode == undefined) {
            return `'to' block not defined in view ${viewId}`
        }
        let to = parseCoordinates3D(toNode, `'to' tag of ${viewType} ${viewId}`, sxsReader)
        if (!Array.isArray(to)) {
            return to;
        }



        if (viewType == 'perspective') {
            let fov = sxsReader.reader.getFloat(viewNode, 'angle', false);
            res = testFloat(fov, 'angle', 'view', viewId)
            if (res != null) {
                return res;
            }

            cameras[viewId] = new CGFcamera(fov * Math.PI / 180, near, far, vec3.fromValues(...from), vec3.fromValues(...to));
        }
        else {
            const left = sxsReader.reader.getFloat(viewNode, 'left', false);
            res = testFloat(left, 'left', viewType, viewId)
            if (res != null) {
                return res;
            }

            const right = sxsReader.reader.getFloat(viewNode, 'right', false);
            res = testFloat(right, 'right', viewType, viewId)
            if (res != null) {
                return res;
            }

            const top = sxsReader.reader.getFloat(viewNode, 'top', false);
            res = testFloat(top, 'top', viewType, viewId)
            if (res != null) {
                return res;
            }

            const bottom = sxsReader.reader.getFloat(viewNode, 'bottom', false);
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
                up = parseCoordinates3D(upNode, `'up' tag of ${viewType} ${viewId}`, sxsReader)
                if (!Array.isArray(up)) {
                    return up;
                }
                
                // Only one element is allowed, and must be 1
                if(up[0] + up[1] + up[2] !== 1 || ((up[0] != 0 && up[0] != 1) || (up[1] != 0 && up[1] != 1) || (up[2] != 0 && up[2] != 1))){
                    sxsReader.graph.onXMLMinorError(`Invalid 'up' tag of ${viewType} ${viewId}. Only one coordinate can be 1, assuming x=0 y=1 z=0`);
                    up = [0, 1, 0];
                }
            }


            cameras[viewId] = new CGFcameraOrtho(left, right, bottom, top, near, far, vec3.fromValues(...from), vec3.fromValues(...to), vec3.fromValues(...up))
        }
    }
    if (cameras[defaultCameraId] == undefined && this.mainFile === true) {
        return "Couldn't find default camera with id " + defaultCameraId;
    }

    sxsReader.attributes.set('cameras', cameras)
    sxsReader.attributes.set('defaultCameraId', defaultCameraId)
    return;
}

function testFloat(value, attribute, block, id) {
    if (value == null || isNaN(value)) {
        return `Invalid value of ${attribute} attribute. In ${block} ${id}`;
    }
    return null;
}