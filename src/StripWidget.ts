import { Color, hDJRecvCmd, hDJRecvCoord, MessageType } from "homebrewdj-launchpad-driver";
import { EventEmitter } from "stream";
import { hDJControlStripButton, hDJControlStripWidget } from "./hDJMidiModel";

const START_MIDI = 0x20;

import { hDJMidiSend } from "./hDJMidiSend";

export class StripWidget extends EventEmitter implements hDJControlStripWidget {
    inverted: boolean;
    playing: boolean;
    controlStrip: hDJControlStripButton[];
    width: number = 4;
    height: number = 1;
    port: number;

    private selectedCue: hDJControlStripButton | null = null;

    offset: number = 0;

    private sender: hDJMidiSend = new hDJMidiSend();

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
        let btn = this.controlStrip[i];

        switch (btn) {
            case hDJControlStripButton.CUE1:
            case hDJControlStripButton.CUE2:
            case hDJControlStripButton.CUE3:
                this.playCue(btn, msg);
                break;
            case hDJControlStripButton.TRACKSELECT:
                console.log("TRACKSELECT");
                this.sender.send([msg.type | this.port, START_MIDI + (this.offset * this.width) + 3, msg.velocity])
                if (msg.type == MessageType.NOTE_OFF) {
                    this.playing = !this.playing;
                    if (!this.playing) {
                        this.selectedCue = null;
                    } else {
                        this.selectedCue = hDJControlStripButton.CUE1;
                    }
                    this.emit("strip_play", this.offset, this.selectedCue);
                }
                break;
        }

        this.emit("change");
    }

    private playCue(cue: hDJControlStripButton, msg: hDJRecvCmd) {
        this.sender.send([msg.type | this.port, START_MIDI + (this.offset * this.width) + cue, msg.velocity])
        this.selectedCue = cue;
        this.playing = true;
        this.emit("strip_play", this.offset, cue);
    }

    stopStrip() {
        this.playing = false;
        this.selectedCue = null;
        //TODO Send output to virtual midi port
        //this.sender.send(messages.stop-strip)
    }

    getAsBuffer(): number[] {
        return [
            ...this.controlStrip.map((e: hDJControlStripButton, index: number) => {
                if (e == hDJControlStripButton.TRACKSELECT) {
                    return this.playing ? Color.RED2 : Color.RED1;
                } else {
                    return e == this.selectedCue ? Color.ORANGE1 : Color.ORANGE5;
                }
            })
        ]

    }
}
