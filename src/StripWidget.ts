import { Color, hDJRecvCmd, hDJRecvCoord, MessageType } from "homebrewdj-launchpad-driver";
import { EventEmitter } from "stream";
import { hDJControlStripButton, hDJControlStripWidget } from "./hDJMidiModel";

const START_MIDI = 0x20;

import { hDJMidiSend } from "./hDJMidiSend";

/**
 * The Musictrack Control Strip. Holds controls for 3 cue points and the track selector
 *
 * @export
 * @class StripWidget
 * @extends {EventEmitter}
 * @implements {hDJControlStripWidget}
 */
export class StripWidget extends EventEmitter implements hDJControlStripWidget {

    /**
     * Sets if the widget should render back to front and not front to back
     *
     * @type {boolean}
     * @memberof StripWidget
     */
    inverted: boolean;

    /**
     * Holds, if the Track is playing right now
     *
     * @type {boolean}
     * @memberof StripWidget
     */
    playing: boolean;

    /**
     * The Buttons the strip holds
     *
     * @type {hDJControlStripButton[]}
     * @memberof StripWidget
     */
    controlStrip: hDJControlStripButton[];

    /**
     * Width of the Strip
     *
     * @type {number}
     * @memberof StripWidget
     */
    width: number = 4;

    /**
     * Height of the Strip
     *
     * @type {number}
     * @memberof StripWidget
     */
    height: number = 1;

    /**
     * Midi Port of the Strip Widget, inherited from parent deck
     *
     * @type {number}
     * @memberof StripWidget
     */
    port: number;

    /**
     * The currently selected cue point. References the first cue point if no point is selected
     *
     * @private
     * @type {(hDJControlStripButton | null)}
     * @memberof StripWidget
     */
    private selectedCue: hDJControlStripButton | null = null;

    /**
     * Note Offset of the MIDI Notes
     *
     * @type {number}
     * @memberof StripWidget
     */
    offset: number = 0;

    /**
     * Instance of the Sender API
     *
     * @private
     * @type {hDJMidiSend}
     * @memberof StripWidget
     */
    private sender: hDJMidiSend = new hDJMidiSend();

    /**
     * Creates an instance of StripWidget.
     * @param {number} port
     * @param {number} row
     * @param {boolean} inverted
     * @memberof StripWidget
     */
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

    /**
     * Processes the command sent from the device
     *
     * @param {hDJRecvCmd} msg
     * @param {hDJRecvCoord} data
     * @memberof StripWidget
     */
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

    /**
     * Play the selected Cue Point
     *
     * @private
     * @param {hDJControlStripButton} cue
     * @param {hDJRecvCmd} msg
     * @memberof StripWidget
     */
    private playCue(cue: hDJControlStripButton, msg: hDJRecvCmd) {
        this.sender.send([msg.type | this.port, START_MIDI + (this.offset * this.width) + cue, msg.velocity])
        this.selectedCue = cue;
        this.playing = true;
        this.emit("strip_play", this.offset, cue);
    }

    /**
     * Stop the complete Strip
     *
     * @memberof StripWidget
     */
    stopStrip() {
        this.playing = false;
        this.selectedCue = null;
        //TODO Send output to virtual midi port
        //this.sender.send(messages.stop-strip)
    }

    /**
     * Return the control strip as framebuffer element
     *
     * @return {*}  {number[]}
     * @memberof StripWidget
     */
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
