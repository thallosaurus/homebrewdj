import { hDJMidiRecv, hDJRecvCmd, hDJRecvCoord, MessageType } from "homebrewdj-launchpad-driver";
import { hDJMidiSend } from "./hDJMidiSend";
import { Deck } from "./Deck";
import { hDJWidget } from "./hDJMidiModel";
import { EventEmitter } from "stream";

export interface WidgetQueue {
    data: hDJWidget & EventEmitter,
    pos: hDJRecvCoord
}

function intersects(sourcePoint: hDJRecvCoord, q: WidgetQueue) {
    return sourcePoint.x >= q.pos.x && sourcePoint.x < q.pos.x + q.data.height
        && sourcePoint.y >= q.pos.y && sourcePoint.y < q.pos.y + q.data.width;
}

class Main {
    private queue: WidgetQueue[] = [];
    private launchpad = new hDJMidiRecv();

    constructor() {
        console.log(this.launchpad.enumeratePorts());
        this.launchpad.connect(1, 1);
        const left = new Deck(0);
        this.addToQueue(left, {
            x: 0,
            y: 0
        });
        
        const right = new Deck(1, true);
        this.addToQueue(right, {
            x: 0,
            y: 4
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

    addToQueue(widget: hDJWidget & EventEmitter, pos: hDJRecvCoord) {
        widget.on("change", () => {
            this.refreshScreen();
        });

        this.queue.push({
            data: widget,
            pos: pos
        });
    }

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

