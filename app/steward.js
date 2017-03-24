/**
 * Created by Adipat on 3/23/2017.
 */
import { DirectLine } from 'botframework-directlinejs';

function Steward() {

    function Ask(from, message) {
        var directLine = new DirectLine({
            secret: '8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM'
        });

        directLine.postActivity({
            from: { id: from},
            type: 'message',
            text: message}).subscribe(
                id => console.log("Posted activity, assigned ID ", id),
                error => console.log("Error posting activity", error)
        );
    }

    return {
        Ask: Ask
    }
}