function StewardConversation(conv) {

    var userName = conv.name;
    var conversationId = conv.cid;
    var socketUrl = conv.surl;

    var websocket = null;
    var SOCKET_TIMEOUT = 5*60*1000; // 5 MINS
    var currentTimeoutId = null;

    var onReplyCb = null;
    var onEndCb = null;

    function ConversationFinished() {
        ClearTimeOut();

        websocket.onclose = function () {}; // disable onclose handler first
        websocket.close();

        if (onEndCb)
            onEndCb();
    }

    function ClearTimeOut() {
        if (currentTimeoutId)
            clearTimeout(currentTimeoutId);
    }

    function onMsg(event) {
        console.log(event.data);
        var eventObj = JSON.parse(event.data);
        if (eventObj && eventObj.activities && eventObj.activities.length > 0) {
            var response = eventObj.activities[0];
            if (response.from.id === 'StewardTRBot') {
                if (onReplyCb) {
                    onReplyCb(response.text);
                }
            }
        }
    }

    function StartWebSocketConnection() {

        ClearTimeOut();

        websocket = new WebSocket(socketUrl);
        websocket.onmessage = onMsg;

        currentTimeoutId = setTimeout(ConversationFinished, SOCKET_TIMEOUT);
    }

    function Ask(question) {
        StartWebSocketConnection(); // start websocket connection and timer to 5 mins to close

        $.ajax({
            type: 'POST',
            contentType: "application/json",
            url: 'https://directline.botframework.com/v3/directline/conversations/' + conversationId + '/activities',
            headers: { 'Authorization': 'Bearer 8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM' },
            data: JSON.stringify({
                "type": "message",
                "from": {
                    "id": userName
                },
                "text": question
            })
        }).done(function(result){
            console.log(result);
        })
        .fail(function(){
            console.log('error during send message');
        });
    }

    function Replying(replyingCb) {
        onReplyCb = replyingCb;
    }

    function End(endCb) {
        onEndCb = endCb;
    }

    return {
        Ask: Ask,
        Replying: Replying,
        End: End
    }
}