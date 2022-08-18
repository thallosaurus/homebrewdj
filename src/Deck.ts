import { hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";
import { EventEmitter } from "stream";
import { hDJControlStripWidget, hDJWidget } from "./hDJMidiModel";
import { StripWidget } from "./StripWidget";

/**
 * The Deck Holder. Is used to group elements together that correspond to one track
 *
 * @export
 * @class Deck
 * @extends {EventEmitter}
 * @implements {hDJWidget}
 */
export class Deck extends EventEmitter implements hDJWidget {
    
    /**
     * The Width of the Deck
     *
     * @type {number}
     * @memberof Deck
     */
    width: number = 4;

    /**
     * The Height of the Deck
     *
     * @type {number}
     * @memberof Deck
     */
    height: number = 6;

    /**
     * All child widgets of this deck
     *
     * @type {hDJWidget[]}
     * @memberof Deck
     */
    children: hDJWidget[] = [];

    /**
     * MIDI-Port Number
     *
     * @type {number}
     * @memberof Deck
     */
    port: number;

    /**
     * Creates an instance of Deck.
     * @param {number} port
     * @param {boolean} [inverted=false]
     * @memberof Deck
     */
    constructor(port: number, inverted: boolean = false) {
        super();
        this.port = port;
        for (let row = 0; row < this.height; row++) {
            let strip = new StripWidget(this.port, row, inverted)
            this.addChildWidget(strip)
        }
    }

    /**
     * Add child widget to this widget.
     *
     * @param {hDJControlStripWidget} widget
     * @memberof Deck
     */
    addChildWidget(widget: hDJControlStripWidget): void
    {
        widget.on("strip_play", (row, cue) => {
            console.log("row", row, "cue", cue);
            let stopQueue = this.children.filter((v, i) => {
                return i !== row
            });

            for (const s of stopQueue) {
                (s as StripWidget).stopStrip();
            }
        })
        this.children.push(widget);
    }

    /**
     * Pass down event to the corresponding child element
     * @param data 
     */
    processEvent(msg: hDJRecvCmd, data: hDJRecvCoord): void {
        //console.log(data);
        let strip = this.children[data.x];
        strip.processEvent(msg, {
            x: 0,
            y: data.y
        });

        //console.log("now playing on", this.playingDeck());

        this.emit("change");
    }

    /**
     * Constructs a framebuffer frame for the launchpad driver
     *
     * @return {*}  {number[]}
     * @memberof Deck
     */
    getAsBuffer(): number[] {
        let b: number[] = [];

        for (let child of this.children) {
            b = [...b, ...child.getAsBuffer()];
        }

        return b;
    }


}