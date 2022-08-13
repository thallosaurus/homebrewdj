import { hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";
import { hDJWidget } from "./hDJMidiModel";
import { StripWidget } from "./StripWidget";

export class Deck extends EventTarget implements hDJWidget{
    width: number = 4;
    height: number = 6;
    children: hDJWidget[] = [];
    port: number;

    constructor(port: number, inverted: boolean = false) {
        super();
        this.port = port;
        for (let i = 0; i < this.height; i++) {
            this.children.push(new StripWidget(port, i, inverted));
        }
    }

    /**
     * Pass down event to the corresponding child element
     * @param data 
     */
    processEvent(msg: hDJRecvCmd, data: hDJRecvCoord): void {
        let strip = this.children[data.x];
        strip.processEvent(msg, {
            x: 0,
            y: data.y
        });
    }

    getAsBuffer(): number[] {
        let b: number[] = [];

        for (let child of this.children) {
            b = [...child.getAsBuffer(), ...b];
        }

        return b;
    }


}