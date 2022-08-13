import { hDJMidiRecv, hDJRecvCoord, MessageType } from "homebrewdj-launchpad-driver";
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
    launchpad.connect(0, 0);

    let queue: WidgetQueue[] = [
        {
            data: new Deck(),
            pos: {
                x: 0,
                y: 0
            }
        },
        {
            data: new Deck(true),
            pos: {
                x: 2,
                y: 4
            }
        }
    ];

    launchpad.on("matrix_event", (data) => {
        //console.log(data);

        if (data.type == MessageType.NOTE_ON) {
            let row = data.pos?.x;
            let col = data.pos?.y;

            let touchTarget = queue.find((v, i) => {
                let hasTappedWidget = intersects(data.pos!, v);
                //console.log(hasTappedWidget);
                return hasTappedWidget;
            });

            //We tapped on a mapped button
            if (touchTarget) {
                //console.log(touchTarget, row! - touchTarget!.pos.x, col! - touchTarget!.pos.y);
                let relPos = {
                    x: row! - touchTarget!.pos.x,
                    y: col! - touchTarget!.pos.y
                };

                touchTarget?.data.processEvent(relPos);
            }

        }
    });

    for (let e of queue) {
        launchpad.boundBuffer.setXY(e.data.getAsBuffer(), e.pos, e.data.width);
    }

    //console.log(launchpad.boundBuffer);
}
main();