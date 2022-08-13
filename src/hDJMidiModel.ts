import { hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";
import { StripWidget } from "./StripWidget";

/**
 * Holds methods for acting as a homebrewDJ Widget
 *
 * @interface hDJWidget
 * @extends {hDJRecvCoord}
 */
export interface hDJWidget {
    width: number;
    height: number;
    getAsBuffer(): number[];
    processEvent(data: hDJRecvCoord): void;
}

/**
 * Holds the color State for the control strip
 *
 * @interface hDJControlStripWidget
 * @extends {hDJWidget}
 */
export interface hDJControlStripWidget extends hDJWidget {
    inverted: boolean;
    playing: boolean;
    controlStrip: hDJControlStripButton[];
}

/**
 * Represents a ControlStripButton
 *
 * @enum {number}
 */
export enum hDJControlStripButton {
    CUE1,
    CUE2,
    CUE3,
    TRACKSELECT
}