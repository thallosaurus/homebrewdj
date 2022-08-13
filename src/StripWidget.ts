import { Color, hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";
import { hDJControlStripButton, hDJControlStripWidget } from "./hDJMidiModel";

export class StripWidget implements hDJControlStripWidget {
    inverted: boolean;
    playing: boolean;
    controlStrip: hDJControlStripButton[];
    width: number = 4;
    height: number = 1;

    //row: number;

    constructor(row: number, inverted: boolean) {
        //this.row = row;
        this.inverted = inverted;
        this.playing = false;
        if (this.inverted) {
            this.controlStrip = [
                hDJControlStripButton.TRACKSELECT,
                hDJControlStripButton.CUE1,
                hDJControlStripButton.CUE2,
                hDJControlStripButton.CUE3,
            ];
        } else
            this.controlStrip = [
                hDJControlStripButton.CUE1,
                hDJControlStripButton.CUE2,
                hDJControlStripButton.CUE3,
                hDJControlStripButton.TRACKSELECT,
            ];
    }
    processEvent(data: hDJRecvCoord): void {
        let i = data.y;

        switch (this.controlStrip[i]) {
            case hDJControlStripButton.CUE1:
                console.log("CUE1");
                break;
            case hDJControlStripButton.CUE2:
                console.log("CUE2");
                break;
            case hDJControlStripButton.CUE3:
                console.log("CUE3");
                break;
            case hDJControlStripButton.TRACKSELECT:
                console.log("TRACKSELECT");
                break;
        }
    }
    getAsBuffer(): number[] {
        return this.controlStrip.map((e) => {
            return e == hDJControlStripButton.TRACKSELECT ? Color.RED3 : Color.ORANGE2;
        });
    }
}
