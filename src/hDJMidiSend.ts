import * as midi from 'midi';
import { Ableton } from 'ableton-js';

/**
 * Holds methods for sending data to a DAW
 *
 * @export
 * @class hDJMidiSend
 */
export class hDJMidiSend {

    /**
     * Output Port to DAW
     *
     * @private
     * @static
     * @type {midi.Output}
     * @memberof hDJMidiSend
     */
    private static portOutput: midi.Output = new midi.Output();

    /**
     * Input Port from DAW
     *
     * @private
     * @static
     * @type {midi.Output}
     * @memberof hDJMidiSend
     */
    private static portInput: midi.Output = new midi.Output();

    /**
     * Do the Virtual Ports exist?
     *
     * @private
     * @static
     * @type {boolean}
     * @memberof hDJMidiSend
     */
    private static isOpen: boolean = false;


    
    /**
     * Creates an instance of hDJMidiSend. If Connection is not open it opens a input and output port to DAW
     * @memberof hDJMidiSend
     */
    constructor() {

        if (!hDJMidiSend.isOpen) {
            //hDJMidiSend.portOutput.openVirtualPort("Test");
            //hDJMidiSend.portInput.openVirtualPort("Test");
            hDJMidiSend.isOpen = true;
        }
    }

    /**
     * Closes ports and sets connection flag to false
     *
     * @static
     * @memberof hDJMidiSend
     */
    static close(): void {
        if (hDJMidiSend.isOpen) {
            hDJMidiSend.portOutput.closePort();
            hDJMidiSend.portInput.closePort();
            hDJMidiSend.isOpen = false
        }
    }

    /**
     * Send raw Midi Data to DAW
     *
     * @param {midi.MidiMessage} data
     * @memberof hDJMidiSend
     */
    send(data: midi.MidiMessage): void {
        //console.log(data, hDJMidiSend.portOutput);
        //hDJMidiSend.portOutput.send(data);

    }
}