import { CGFapplication } from '../../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import { buildDebugFolder } from './interface/build.js';
import { GameController } from './checkers/controller/GameController.js';

function getUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}


function main() {
    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
    // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 

    const filename = getUrlVars()['file'] || 'demo.xml';

    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();
    const myScene = new XMLscene(myInterface);
    

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);
    buildDebugFolder(myInterface, myScene);

    const sceneGraphs = [];
    sceneGraphs[filename] = new MySceneGraph(filename, myScene);
    //sceneGraphs['room'] = new MySceneGraph('demo.xml', myScene, 'room');
    
    
    //sceneGraphs['blendertest'] = new MySceneGraph('blendertest.xml', myScene, 'blendertest');


    const currentGraph = { value: Object.keys(sceneGraphs)[0] };
    myScene.graph = sceneGraphs[currentGraph.value];
    myScene.graph.selected = true;

    myInterface.gui.add(currentGraph, 'value', Object.keys(sceneGraphs)).name('Scene').onChange(() => {
        myScene.graph.ui.hide();
        myScene.graph = sceneGraphs[currentGraph.value];
        myScene.onGraphLoaded();
    });

    const gameController = new GameController(myScene);
    app.run();
}

main();
