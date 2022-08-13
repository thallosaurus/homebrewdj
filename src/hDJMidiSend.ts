import * as midi from 'midi';

export class hDJMidiSend {
    private static portOutput: midi.Output = new midi.Output();
    private static portInput: midi.Output = new midi.Output();
    private static isOpen: boolean = false;
    
    constructor() {

        if (!hDJMidiSend.isOpen) {
            hDJMidiSend.portOutput.openVirtualPort("Test");
            hDJMidiSend.portInput.openVirtualPort("Test");
            hDJMidiSend.isOpen = true;
        }
        //hDJMidiSend.portOutput
    }

    static close(): void {
        if (hDJMidiSend.isOpen) {
            hDJMidiSend.portOutput.closePort();
            hDJMidiSend.portInput.closePort();
        }
    }

    send(data: midi.MidiMessage): void {
        console.log(data, hDJMidiSend.portOutput);
        hDJMidiSend.portOutput.send(data);
    }
}