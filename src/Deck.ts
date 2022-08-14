import { hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";
import { EventEmitter } from "stream";
import { hDJControlStripButton, hDJControlStripWidget, hDJWidget } from "./hDJMidiModel";
import { StripWidget } from "./StripWidget";

export class Deck extends EventEmitter implements hDJWidget {
    width: number = 4;
    height: number = 6;
    children: hDJWidget[] = [];
    port: number;

    constructor(port: number, inverted: boolean = false) {
        super();
        this.port = port;
        for (let row = 0; row < this.height; row++) {
            let strip = new StripWidget(this.port, row, inverted)
            this.addChildWidget(strip)
        }
    }

    addChildWidget(widget: hDJControlStripWidget): void
    {
        //widget.on("strip_play", (row) => {
        /*    //console.log("Playing now on row", row);

            let stopQueue = this.children.filter((v, i) => {
                return i !== row
            });
        });*/

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

    getAsBuffer(): number[] {
        let b: number[] = [];

        for (let child of this.children) {
            b = [...b, ...child.getAsBuffer()];
        }

        return b;
    }


}