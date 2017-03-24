/**
 * Created by Adipat on 3/23/2017.
 */
function Steward() {

    var conversations = []; // [{from: "adipat.larprattanakul.thomsonreuters.com@reuters.net", cid: 3}]

    function getConversation(from) {
        var result = $.grep(conversations, function(e) {
            return e.from === from;
        });

        if (result.length > 0)
            return result[0].cid;

        return null;
    }

    function Ask(from, message) {

        // get

        var directLine = DirectLine({
            secret: '8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM'
        });

        directLine.postActivity({
            from: { id: from},
            type: 'message',
            text: message}).sub;
    }

    return {
        Ask: Ask
    }
}