import { Color, hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";
import { EventEmitter } from "stream";
import { hDJControlStripButton, hDJControlStripWidget } from "./hDJMidiModel";

const START_MIDI = 0x20;

import { hDJMidiSend } from "./hDJMidiSend";
//midiOutput.hDJSen

export class StripWidget extends EventEmitter implements hDJControlStripWidget {
    inverted: boolean;
    playing: boolean;
    controlStrip: hDJControlStripButton[];
    width: number = 4;
    height: number = 1;
    port: number;

    offset: number = 0;

    private sender: hDJMidiSend = new hDJMidiSend();

    //row: number;

    constructor(port: number, row: number, inverted: boolean) {
        super();
        this.port = port;
        this.offset = row;
        this.inverted = inverted;
        this.playing = false;
        if (this.inverted) {
            this.controlStrip = [
                hDJControlStripButton.TRACKSELECT,
                hDJControlStripButton.CUE3,
                hDJControlStripButton.CUE2,
                hDJControlStripButton.CUE1,
            ];
        } else
            this.controlStrip = [
                hDJControlStripButton.CUE1,
                hDJControlStripButton.CUE2,
                hDJControlStripButton.CUE3,
                hDJControlStripButton.TRACKSELECT,
            ];
    }
    processEvent(msg: hDJRecvCmd, data: hDJRecvCoord): void {
        let i = data.y;

        switch (this.controlStrip[i]) {
            case hDJControlStripButton.CUE1:
                console.log("CUE1");
                this.sender.send([msg.type | this.port, START_MIDI + (this.offset * this.width), msg.velocity])
                break;
            case hDJControlStripButton.CUE2:
                console.log("CUE2");
                this.sender.send([msg.type | this.port, START_MIDI + (this.offset * this.width) + 1, msg.velocity])
                break;
            case hDJControlStripButton.CUE3:
                console.log("CUE3");
                this.sender.send([msg.type | this.port, START_MIDI + (this.offset * this.width) + 2, msg.velocity])
                break;
            case hDJControlStripButton.TRACKSELECT:
                console.log("TRACKSELECT");
                this.sender.send([msg.type | this.port, START_MIDI + (this.offset * this.width) + 3, msg.velocity])
                break;
        }
    }
    getAsBuffer(): number[] {
        return this.controlStrip.map((e) => {
            return e == hDJControlStripButton.TRACKSELECT ? Color.RED3 : Color.ORANGE2;
        });
    }
}
