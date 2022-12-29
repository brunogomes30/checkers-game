import { CGFapplication } from '../../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import { buildDebugFolder } from './interface/build.js';

 function main() {

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
    sceneGraphs['room'] = new MySceneGraph('demo.xml', myScene, 'room');
    sceneGraphs['blendertest'] = new MySceneGraph('blendertest.xml', myScene, 'blendertest');


    const currentGraph = { value: Object.keys(sceneGraphs)[0] };
    myScene.graph = sceneGraphs[currentGraph.value];
    myScene.graph.selected = true;
    
    myInterface.gui.add(currentGraph, 'value', Object.keys(sceneGraphs)).name('Scene').onChange(() => {
        myScene.graph.ui.hide();
        myScene.graph = sceneGraphs[currentGraph.value];
        myScene.onGraphLoaded();
    });

    // start
    app.run();
}

main();
