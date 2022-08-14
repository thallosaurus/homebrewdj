import { hDJRecvCmd, hDJRecvCoord } from "homebrewdj-launchpad-driver";

/**
 * Holds methods for acting as a homebrewDJ Widget
 *
 * @interface hDJWidget
 * @extends {hDJRecvCoord}
 */
export interface hDJWidget {
    port: number;
    width: number;
    height: number;
    getAsBuffer(): number[];
    processEvent(msg: hDJRecvCmd, data: hDJRecvCoord): void;
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

export declare interface hDJControlStripWidget {
    on(event: 'strip_play', listener: (row: number, cue: hDJControlStripButton) => void): this;
    emit(event: 'strip_play', listener: (row: number, cue: hDJControlStripButton) => void): void;
    on(event: 'change', listener: () => void): this;
    emit(event: 'change', listener: () => void): void;
}

export declare interface hDJWidget {
    on(event: 'change', listener: () => void): this;
    emit(event: 'change', listener: () => void): void;
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