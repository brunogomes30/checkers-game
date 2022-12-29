import { CGFapplication } from '../../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}

async function main() {

    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();
    const myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
    // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 

    const filename = getUrlVars()['file'] || "demo.xml";

    // create and load graph, and associate it to scene. 
    // Check console for loading errors
    // TODO: Add graph to graph aray/map and set one as scene.graph
    // TODO: Add the graphs to the interface and build selector
    const sceneGraphs = [];
    sceneGraphs['room'] = new MySceneGraph('demo.xml', myScene);
    sceneGraphs['blendertest'] = new MySceneGraph('blendertest.xml', myScene);


    const currentGraph = { value: Object.keys(sceneGraphs)[0] };
    myScene.graph = sceneGraphs[currentGraph.value];
    myScene.graph.selected = true;
    
    myInterface.gui.add(currentGraph, 'value', Object.keys(sceneGraphs)).name('Scene').onChange(() => {
        myScene.graph = sceneGraphs[currentGraph.value];
        myScene.onGraphLoaded();
    });

    // start
    app.run();
}

main();
