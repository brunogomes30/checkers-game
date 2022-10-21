import { CGFinterface, CGFapplication, dat } from '../../lib/CGF.js';

/**
 * MyInterface
 * @constructor
 * @param {CGFapplication} application
 */
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        this.initKeys();

        return true;
    }

    /**
     * Initializes keys input variables
     */
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }

    /**
     * Called when the user presses a key
     * @param {Event} event
     */
    processKeyDown(event) {
        this.activeKeys[event.code] = true;
        if(event.code === 'KeyM'){
            this.scene.materialIndex++;
        }
    };

    /**
     * Called when the user releases a key
     * @param {Event} event
     */
    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    /**
     * Returns true if the key is currently pressed
     * @param {String} keyCode
     * @returns {Boolean}
     */
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}