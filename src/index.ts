import { hDJMidiRecv, hDJRecvCmd, hDJRecvCoord, MessageType } from "homebrewdj-launchpad-driver";
import { hDJMidiSend } from "./hDJMidiSend";
import { Deck } from "./Deck";
import { hDJWidget } from "./hDJMidiModel";

interface WidgetQueue {
    data: hDJWidget,
    pos: hDJRecvCoord
}

function intersects(sourcePoint: hDJRecvCoord, q: WidgetQueue) {
    //console.log(sourcePoint, q);
    return sourcePoint.x >= q.pos.x && sourcePoint.x < q.pos.x + q.data.height
        && sourcePoint.y >= q.pos.y && sourcePoint.y < q.pos.y + q.data.width;
}

/**
 * The main function. Have fun <3
 *
 */
function main() {
    const launchpad = new hDJMidiRecv();
    launchpad.connect(1, 1);

    let queue: WidgetQueue[] = [
        {
            data: new Deck(0),
            pos: {
                x: 0,
                y: 0
            }
        },
        {
            data: new Deck(1, true),
            pos: {
                x: 0,
                y: 4
            }
        }
    ];

    const algo = (data: hDJRecvCmd) => {
        //console.log(data);
            let row = data.pos?.x;
            let col = data.pos?.y;
    
            let touchTarget = queue.find((v, i) => {
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

    launchpad.on("matrix_event_release", algo)

    launchpad.on("matrix_event_press", algo);

    for (let e of queue) {
        launchpad.boundBuffer.setXY(e.data.getAsBuffer(), e.pos, e.data.width);
    }
}
main();

process.on("SIGTERM", () => {
    hDJMidiSend.close();
})