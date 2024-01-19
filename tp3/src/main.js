import { CGFapplication } from '../../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import { buildDebugFolder } from './interface/build.js';
import { GameController } from './checkers/controller/GameController.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
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
    buildDebugFolder(myInterface, myScene);

    let urlVars = getUrlVars();
    let filename= urlVars['file'] || "gametest.xml";
    let game = urlVars['game'] || 'true';
    let isGaming = game === 'true';

    

    const myGraph = new MySceneGraph(filename, myScene, 'game');


    const environments = [];
    myScene.graph = myGraph;
    myScene.graph.selected = true;
    if(isGaming){
        
        environments['room'] = new MySceneGraph('demo.xml', myScene, 'room');
        environments['jungle'] = new MySceneGraph('jungle.xml', myScene, 'jungle');
    
        const currentEnvironment = { value: 'room', last: 'room' };
        //sceneGraphs['blendertest'] = new MySceneGraph('blendertest.xml', myScene, 'blendertest');



        
        const gameController = new GameController(myScene);
        await new Promise((resolve) => {setTimeout(resolve, 1000)});



        changeEnvironment(environments, currentEnvironment, myScene.graph);
        myInterface.gui.add(currentEnvironment, 'value', Object.keys(environments)).name('Environments').onChange(() => {
            changeEnvironment(environments, currentEnvironment, myScene.graph);
        });
    } else {
        environments['game'] = myGraph;
        await new Promise((resolve) => {setTimeout(resolve, 1000)});
        const currentEnvironment = {'last': 'game', 'value': 'game'}; // hacky fix~
        //changeEnvironment(environments, currentEnvironment, myScene.graph);
    }
    

    
    app.run();
}

function changeEnvironment(environments, currentEnvironment, graph) {
    const environment = environments[currentEnvironment.value];
    if (environments[currentEnvironment.last].ui) {
        environments[currentEnvironment.last].ui.hide();
    }
    currentEnvironment.last = currentEnvironment.value;
    for (const key in environments.textures) {
        graph.scene.textures[key] = environments.textures[key];
    }
    graph.removeComponent(graph.idRoot, 'environment');
    graph.addComponent(graph.components[graph.idRoot], environment.components[environment.idRoot]);
    graph.environment_animations = { ...environment.animations };
}

main();

