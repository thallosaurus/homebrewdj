import { Ableton } from "ableton-js";
import { Track } from "ableton-js/ns/track";
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

    //abTrack: Track;

    /**
     * Creates an instance of Deck.
     * @param {number} port
     * @param {boolean} [inverted=false]
     * @memberof Deck
     */
    constructor(port: number, track: Track, inverted: boolean = false) {
        super();
        this.port = port;
        //this.abTrack = track;

        let mod = 0;
        track.get("clip_slots").then((clipSlots) => {
            clipSlots.forEach(async slot => {
                
                if (await slot.get("has_clip")) {
                    let clip = await slot.get("clip");
                    //console.log("clip", clip);
                    
                    //let strip = new StripWidget(this.port, row, this.abTrack, inverted)
                    //this.addChildWidget(strip))
                    
                    let strip = new StripWidget(this.port, clip!, mod, (mod % 1) == 1);
                    this.addChildWidget(strip);
                    mod++;
                }
            });
        });
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