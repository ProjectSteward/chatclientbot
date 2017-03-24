/**
 * Created by Adipat on 3/23/2017.
 */
function Steward() {

    var websocket = null;
    var conversations = []; // [{name: "adipat.larprattanakul.thomsonreuters.com@reuters.net", cid: 3}]

    function onMsg(event) {
        console.log(event.data);
    }

    function getConversationFromName(name) {
        var defer = $.Deferred();
        var result = $.grep(conversations, function(e) {
            return e.name === name;
        });

        if (result.length > 0)
            defer.resolve(result[0]);
        else if (result.length === 0)
        {
            $.ajax({
                type: 'POST',
                url: 'https://directline.botframework.com/v3/directline/conversations',
                headers: { 'Authorization': 'Bearer 8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM' }
            }).done(function (result) {
                websocket = new WebSocket(result.streamUrl);
                websocket.onmessage = onMsg;
                var conv = {
                    name: name,
                    cid: result.conversationId,
                    surl: result.streamUrl
                };
                conversations.push(conv);

                defer.resolve(conv);
            }).fail(function () {
                defer.reject();
            });
        }
        else
            defer.reject();

        return defer.promise();
    }

    function Ask(from, message) {

        // get conversation
        getConversationFromName(from).then(function(result){
            $.ajax({
                type: 'POST',
                contentType: "application/json",
                url: 'https://directline.botframework.com/v3/directline/conversations/' + result.cid + '/activities',
                headers: { 'Authorization': 'Bearer 8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM' },
                data: JSON.stringify({
                    "type": "message",
                    "from": {
                        "id": result.name
                    },
                    "text": message
                })
            }).done(function(result){
                console.log(result);
            })
            .fail(function(err){
                console.log('error');
            });
        });
    }

    function send(from, message)
    {

    }

    return {
        Ask: Ask
    }
}