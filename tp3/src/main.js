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

    const filename = getUrlVars()['file'] || 'gametest.xml';

    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();
    const myScene = new XMLscene(myInterface);


    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);
    buildDebugFolder(myInterface, myScene);


    const myGraph = new MySceneGraph(filename, myScene);


    const environments = [];
    environments['room'] = new MySceneGraph('demo.xml', myScene, 'room');
    environments['jungle'] = new MySceneGraph('jungle.xml', myScene, 'jungle');

    const currentEnvironment = { value: '' };

    //sceneGraphs['blendertest'] = new MySceneGraph('blendertest.xml', myScene, 'blendertest');



    myScene.graph = myGraph;
    myScene.graph.selected = true;

    


    myInterface.gui.add(currentEnvironment, 'value', Object.keys(environments)).name('Environments').onChange(() => {
        changeEnvironment(environments, currentEnvironment, myScene.graph);
    });

    const gameController = new GameController(myScene);
    app.run();
}

function changeEnvironment(environments, currentEnvironment, graph) {
    const environment = environments[currentEnvironment.value];
    if (environment.ui) {
        environment.ui.open();
        environment.ui.show();
    }
    for (const key in environments.textures) {
        graph.scene.textures[key] = environments.textures[key];
    }
    graph.removeComponent(graph.idRoot, 'environment');
    graph.addComponent(graph.components[graph.idRoot], environment.components[environment.idRoot]);
    console.log(environment)
    graph.environment_animations = {...environment.animations};
}

main();

