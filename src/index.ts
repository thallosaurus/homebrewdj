export * from './Deck';
export * from './hDJMidiModel';
export * from './hDJMidiSend';
export * from './StripWidget';

import { hDJMidiRecv, hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";
import { hDJMidiSend } from "./hDJMidiSend";
import { Deck } from "./Deck";
import { hDJWidget } from "./hDJMidiModel";
import { EventEmitter } from "stream";

import { Ableton } from 'ableton-js';

/**
 * Data for one Widget
 *
 * @export
 * @interface WidgetQueue
 */
export interface WidgetQueue {
    data: hDJWidget & EventEmitter,
    pos: hDJRecvCoord
}

/**
 * Checks, if widget intersects the specified coordinates
 *
 * @param {hDJRecvCoord} sourcePoint
 * @param {WidgetQueue} q
 * @return {*} 
 */
function intersects(sourcePoint: hDJRecvCoord, q: WidgetQueue) {
    return sourcePoint.x >= q.pos.x && sourcePoint.x < q.pos.x + q.data.height
        && sourcePoint.y >= q.pos.y && sourcePoint.y < q.pos.y + q.data.width;
}

/**
 * The Main Class
 *
 * @class Main
 */
class Main {

    /**
     * Holds all Widgets that are displayed on the device inclusive its coordinates
     *
     * @private
     * @type {WidgetQueue[]}
     * @memberof Main
     */
    private queue: WidgetQueue[] = [];

    /**
     * Instance of the Launchpad driver
     *
     * @private
     * @memberof Main
     */
    private launchpad = new hDJMidiRecv();

    private abletonjs = new Ableton();

    /**
     * Creates an instance of Main.
     * @memberof Main
     */
    constructor() {
        console.log(this.launchpad.enumeratePorts());
        this.launchpad.connect(1, 1);

        this.abletonjs.on("error", (e) => {
            console.error(e);
        })

        this.abletonjs.on("message", (e) => {
        //console.log(e);
        });

        //this.abletonjs.song.addListener("tempo", (t) => console.log("Tempo:", t));

        //this.abletonjs.song.addListener("is_playing", (p) => console.log("Playing:", p));

        this.abletonjs.on("connect", async (e) => {
            let tracks = await this.abletonjs.song.get("tracks");

            let i = 0;
            if (tracks.length == 2) {
                for (let t of tracks) {
                    const deck = new Deck(i, t, (i & 1) == 1);
                    
                    this.addToQueue(deck, {
                        x: 0,
                        y: i * 4
                    });
                    
                    i++;
                }
            } else {
                throw new Error("Please add only two audio Tracks");
            }
        });


        this.launchpad.on("matrix_event_release", this.loopAlgo.bind(this))

        this.launchpad.on("matrix_event_press", this.loopAlgo.bind(this));

        process.on("SIGTERM", () => {
            hDJMidiSend.close();
        });
        setInterval(() => {
            this.refreshScreen();
        }, 100);
        this.refreshScreen();
    }

    /**
     * Adds a Widget and its position to the widget queue
     *
     * @param {(hDJWidget & EventEmitter)} widget
     * @param {hDJRecvCoord} pos
     * @memberof Main
     */
    addToQueue(widget: hDJWidget & EventEmitter, pos: hDJRecvCoord) {
        widget.on("change", () => {
            this.refreshScreen();
        });

        this.queue.push({
            data: widget,
            pos: pos
        });
    }

    /**
     * Processes events from the launchpad driver
     *
     * @private
     * @param {hDJRecvCmd} data
     * @memberof Main
     */
    private loopAlgo(data: hDJRecvCmd) {
        //console.log(data);
            let row = data.pos?.x;
            let col = data.pos?.y;
    
            let touchTarget = this.queue.find((v, i) => {
                let hasTappedWidget = intersects(data.pos!, v);
                return hasTappedWidget;
            });
    
            //We tapped on a mapped button
            if (touchTarget) {
                let relPos = {
                    x: row! - touchTarget!.pos.x,
                    y: col! - touchTarget!.pos.y
                };
    
                touchTarget?.data.processEvent(data, relPos);
            }
    };

    /**
     * Redraws the widgets on the device
     *
     * @private
     * @memberof Main
     */
    private refreshScreen(): void {
        for (let e of this.queue) {
            this.launchpad.boundBuffer.setXY(e.data.getAsBuffer(), e.pos, e.data.width);
        }
    }
}

/**
 * The main function. Have fun <3
 *
 */
export function mainTui() {
    let main = new Main();

    //init animation loop here?
}
mainTui();

